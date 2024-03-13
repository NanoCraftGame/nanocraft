// @ts-ignore
import probJs from 'prob.js'
import type { Character } from './character'

function calculateRealTime(estimatedTime: number) {
	// system of equations:
	// mode = e^(μ−σ²)
	// percentile = e^(μ+σ*Z)
	const zScore = 2.326 // 99% confidence interval
	const mode = estimatedTime * 0.25 // 25% of the estimated time
	const percentile = estimatedTime * Math.PI // IBM's suggested estimate correction
	// this results in a quadratic equation σ² + Zσ − ln(percentile/mode) = 0
	const a = 1
	const b = zScore
	const c = -Math.log(percentile / mode)
	const d = (b ^ 2) - 4 * a * c
	const sigma1 = (-b + Math.sqrt(d)) / (2 * a)
	const sigma2 = (-b - Math.sqrt(d)) / (2 * a)
	const sigma = Math.max(sigma1, sigma2)
	const mu = Math.log(mode) + sigma ** 2
	const lognormal = probJs.lognormal(mu, sigma)
	const deviation = lognormal() - mode
	return Math.ceil(estimatedTime + deviation)
}

export const scale = 1 / 8 // one tick = 1 day, 1 day has 8 working hours

let counter = 0

export type Status = 'todo' | 'inProgress' | 'done'

interface Serializable {
	serialize(): object
	// TODO should be the same class
	hydrate(data: object): Serializable
}

export class Dependable {
	dependencies: Dependable[] = []
	dependents: Dependable[] = []
	constructor(public id: string) {}

	dependsOn(dependency: Dependable) {
		this.dependencies.push(dependency)
		if (dependency.reportDependents().includes(this)) return
		dependency.neededFor(this)
	}
	neededFor(dependent: Dependable) {
		this.dependents.push(dependent)
		if (dependent.reportDependencies().includes(this)) return
		dependent.dependsOn(this)
	}
	reportDependencies() {
		return this.dependencies
	}
	reportDependents() {
		return this.dependents
	}
}

export enum AttentionSpan {
	FullAttention = 1,
	PartialAttention = 0.1,
}

export abstract class Task extends Dependable implements Serializable {
	abstract requiredAttention: AttentionSpan
	isDormant = false
	status: Status = 'todo'
	private realTime: number
	assignee: string | null = null
	timeSpent = 0
	waitTime = 0

	constructor(
		public name: string,
		public estimate: number,
		public description = '',
	) {
		super(`task-${counter++}`)
		this.realTime = calculateRealTime(estimate)
	}

	get duration() {
		if (this.status === 'todo') {
			return this.estimate
		}
		if (this.status === 'inProgress') {
			return Math.max(this.estimate, this.timeSpent)
		} else {
			return this.timeSpent
		}
	}

	assign(assigneeId: string) {
		if (this.isDormant) {
			console.warn(`Won't assign a dormant task ${this.name} to ${assigneeId}`)
			return
		}
		this.assignee = assigneeId
	}

	tick(attention: number, tick: number) {
		if (this.status === 'inProgress') {
			this.timeSpent = attention * scale + tick * scale - this.waitTime
			if (this.timeSpent >= this.realTime) {
				this.status = 'done'
			}
		}
	}

	setDormant() {
		this.isDormant = true
		this.reportDependents().forEach((dependent) => {
			if (dependent instanceof Task) dependent.setDormant()
		})
	}
	awake() {
		this.isDormant = false
		this.reportDependents().forEach((dependent) => {
			if (dependent instanceof Task) dependent.awake()
		})
	}

	serialize() {
		return {
			type: this.constructor.name,
			id: this.id,
			name: this.name,
			estimate: this.estimate,
			assignee: this.assignee,
			isDormant: this.isDormant,
			status: this.status,
			realTime: this.realTime,
			timeSpent: this.timeSpent,
			waitTime: this.waitTime,
			dependencies: this.dependencies.map((d) => d.id),
			dependents: this.dependents.map((d) => d.id),
		}
	}
	hydrate(data: any): Task {
		// TODO check data fields before hydration
		this.id = data.id
		this.name = data.name
		this.estimate = data.estimate
		this.isDormant = data.isDormant
		this.status = data.status
		this.realTime = data.realTime
		this.dependencies = data.dependencies
		this.dependents = data.dependents
		return this
	}
}

interface DecisionOption {
	description: string
	task: Task
}

type UnlockListener = (decision: Decision) => void

export class Decision extends Dependable implements Serializable {
	status: 'todo' | 'done' = 'todo'
	private unlockListener: UnlockListener
	constructor(
		public report: string,
		public options: DecisionOption[],
	) {
		super(`decision-${counter++}`)
		this.prepareOptions()
	}

	private prepareOptions() {
		this.options.forEach((option) => {
			this.neededFor(option.task)
		})
	}

	optionize() {
		this.dependents.forEach((dependent) => {
			if (dependent instanceof Task) {
				dependent.setDormant()
			}
		})
	}

	tick() {
		if (
			this.reportDependencies().every((task) => {
				if (task instanceof Task || task instanceof Decision) {
					return task.status === 'done'
				}
				return false
			}) &&
			this.unlockListener &&
			this.status !== 'done'
		) {
			this.unlockListener(this)
		}
	}
	onUnlock(callback: UnlockListener) {
		this.unlockListener = callback
	}
	decide(option: DecisionOption) {
		option.task.awake()
		this.status = 'done'
	}
	serialize(): object {
		return {
			type: this.constructor.name,
			id: this.id,
			report: this.report,
			status: this.status,
			options: this.options.map((o) => ({
				description: o.description,
				task: o.task.id,
			})),
			dependencies: this.dependencies.map((d) => d.id),
			dependents: this.dependents.map((d) => d.id),
		}
	}
	hydrate(data: any): Decision {
		// TODO check data fielda befroe hydration
		this.report = data.report
		this.options = data.options
		this.prepareOptions()
		this.id = data.id
		this.status = data.status
		this.dependencies = data.dependencies
		return this
	}
}

type TaskFactory = (type: string) => Task

export class PmSim implements Serializable {
	private tasks: Task[] = []
	private decisions: Decision[] = []
	private taskFactory: TaskFactory | null = null

	registerGraph(graphs: Dependable[]) {
		// detect cycles
		graphs.forEach((graph) => {
			const visited = new Set()
			const stack = new Set()
			const detect = (node: Dependable) => {
				if (stack.has(node)) {
					throw new Error('Cycle depencies in taks graph, suspicous node: ' + getNodeName(node))
				}
				if (visited.has(node)) return
				visited.add(node)
				stack.add(node)
				node.reportDependents().forEach((dependent) => detect(dependent))
				stack.delete(node)
			}
			detect(graph)
		})
		// DFS to find root nodes
		const roots: Dependable[] = []
		const visitedRoots = new Set()
		function dfsRoots(node: Dependable) {
			if (visitedRoots.has(node)) return
			visitedRoots.add(node)
			const children = [...node.reportDependents(), ...node.reportDependencies()]
			children.forEach(dfsRoots)
			if (node.reportDependencies().length === 0 && !roots.includes(node)) roots.push(node)
		}
		graphs.forEach((graph) => dfsRoots(graph))

		// toposort with DFS
		const tasks: Task[] = []
		const descisions: Decision[] = []
		const visited4Tasks = new Set()
		function dfTasks(node: Dependable) {
			if (visited4Tasks.has(node)) return
			visited4Tasks.add(node)
			node.reportDependents().forEach(dfTasks)
			if (node instanceof Task) tasks.push(node)
			if (node instanceof Decision) descisions.push(node)
		}

		roots.forEach((graph) => dfTasks(graph))

		this.tasks = tasks.reverse()
		this.decisions = descisions.reverse()
		this.decisions.forEach((decision) => {
			decision.optionize()
		})
	}
	tick(currentTick: number) {
		type Queue = { all: Task[]; active: Task[] }
		type QueuesMap = Record<string, Queue>
		const queues = this.tasks.reduce<QueuesMap>((acc, task) => {
			if (task.assignee) {
				if (acc[task.assignee]) {
					acc[task.assignee]!.all.push(task)
					if (task.status === 'inProgress') {
						acc[task.assignee]!.active.push(task)
					}
				} else {
					acc[task.assignee] = {
						all: [task],
						active: task.status === 'inProgress' ? [task] : [],
					}
				}
			}
			return acc
		}, {})

		for (let task of this.tasks) {
			// transition tasks from todo to inProgress if possible
			let attentionSpan = task.requiredAttention
			const waitFor = task.reportDependencies()
			if (task.assignee) {
				const assigneeTasks = queues[task.assignee]
				const canStart = task.reportDependencies().every((d) => isResolved(d))
				const hasFull = assigneeTasks?.active.some(
					(t) => t.requiredAttention === AttentionSpan.FullAttention,
				)
				const partials =
					assigneeTasks?.active.filter(
						(t) => t.requiredAttention === AttentionSpan.PartialAttention,
					) || []
				let canDo = false
				if (task.requiredAttention === AttentionSpan.FullAttention) {
					canDo = !hasFull
					attentionSpan = 1 - partials.length * 0.1
				} else {
					const maxPartials = hasFull ? 3 : 5
					canDo = partials.length < maxPartials
				}
				if (canDo && canStart && task.status === 'todo') {
					task.status = 'inProgress'
					if (assigneeTasks) {
						assigneeTasks.active.push(task)
					} else {
						queues[task.assignee] = {
							all: [task],
							active: [task],
						}
					}
				}
				const prevTask = assigneeTasks?.all[assigneeTasks.all.indexOf(task) - 1]
				if (prevTask) waitFor.push(prevTask)
			}
			if (task.status !== 'done') {
				let waitTime = task.status === 'todo' ? currentTick * scale : task.waitTime
				task.waitTime = Math.max(waitTime, findLongestEnd(waitFor))
			}
			task.tick(attentionSpan, currentTick)
		}

		this.decisions.forEach((decision) => {
			decision.tick()
		})
	}
	getTasks(): Task[] {
		return this.tasks
	}

	assign(character: Character, task: Task) {
		if (character.canTake(task)) {
			task.assign(character.id)
		}
	}
	onDecisionUnlocked(fn: (decision: Decision) => void) {
		this.decisions.forEach((decision) => {
			decision.onUnlock(fn)
		})
	}

	serialize(): object {
		return {
			type: this.constructor.name,
			tasks: this.tasks.map((t) => t.serialize()),
			decisions: this.decisions.map((d) => d.serialize()),
		}
	}
	hydrate(data: any): PmSim {
		if (!this.taskFactory) {
			throw new Error('Task factory not set')
		}
		const registry = new Map<string, Dependable>()
		for (let taskData of data.tasks) {
			const task = this.taskFactory(taskData.type)
			registry.set(taskData.id, task)
		}
		for (let decisionData of data.decisions) {
			const decision = new Decision('', [])
			registry.set(decisionData.id, decision)
		}
		for (let taskData of data.tasks) {
			const task = registry.get(taskData.id)
			if (!task || !(task instanceof Task)) throw new Error(`Task ${taskData.id} not found`)
			hydrateDependables(taskData, registry)
			task.hydrate(taskData)
			this.tasks.push(task)
		}
		for (let decisionData of data.decisions) {
			const decision = registry.get(decisionData.id)
			if (!decision || !(decision instanceof Decision))
				throw new Error(`Decision ${decisionData.id} not found`)
			hydrateDependables(decisionData, registry)
			decisionData.options = decisionData.options.map((o: any) => {
				const task = registry.get(o.task)
				if (!task || !(task instanceof Task)) throw new Error(`Task ${o.task} not found`)
				return { description: o.description, task }
			})
			decision.hydrate(decisionData)
			this.decisions.push(decision)
		}

		function hydrateDependables(data: any, registry: Map<string, Dependable>) {
			data.dependencies = data.dependencies.map((d: string) => {
				const dependency = registry.get(d)
				if (!dependency) throw new Error(`Dependency not found, ${d}`)
				return dependency
			})
			data.dependents = data.dependents.map((d: string) => {
				const dependent = registry.get(d)
				if (!dependent) throw new Error(`Dependent not found, ${d}`)
				return dependent
			})
		}
		return this
	}

	setTaskFactory(factory: TaskFactory) {
		this.taskFactory = factory
	}

	clear() {
		this.tasks = []
		this.decisions = []
	}
}

function getNodeName(node: Dependable) {
	let nodeName = node instanceof Task ? node.name : node.id
	nodeName = node instanceof Decision ? node.report.slice(0, 20) + '…' : nodeName
	return nodeName
}

function isResolved(dependency: Dependable) {
	if (dependency instanceof Task) {
		return dependency.status === 'done'
	}
	if (dependency instanceof Decision) {
		return dependency.status === 'done'
	}
	return false
}

function findLongestEnd(dependencies: Dependable[]): number {
	const ends = dependencies.map((dependency) => {
		if (dependency instanceof Task) {
			return dependency.duration + dependency.waitTime
		}
		if (dependency instanceof Decision) {
			return findLongestEnd(dependency.reportDependencies())
		}
		return 0
	})

	return Math.max(...ends, 0)
}
