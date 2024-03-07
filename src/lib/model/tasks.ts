// @ts-ignore
import probJs from 'prob.js'

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
	hydrate(data: object): void
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

	constructor(
		public name: string,
		public estimate: number,
		public description = '',
	) {
		super(`task-${counter++}`)
		this.realTime = calculateRealTime(estimate)
	}

	assign(assigneeId: string) {
		if (this.isDormant) {
			console.warn(`Won't assign a dormant task ${this.name} to ${assigneeId}`)
			return
		}
		this.assignee = assigneeId
	}

	tick(attention: number) {
		if (this.status === 'inProgress') {
			this.timeSpent += attention * scale
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
			estimatedTime: this.estimate,
			attentionSpan: this.requiredAttention,
			isDormant: this.isDormant,
			status: this.status,
			realTime: this.realTime,
			dependencies: this.dependencies.map((d) => d.id),
			dependents: this.dependents.map((d) => d.id),
		}
	}
	hydrate(data: object): void {
		throw new Error('Method not implemented.')
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
		options.forEach((option) => {
			this.neededFor(option.task)
			option.task.setDormant()
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
			this.unlockListener
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
		throw new Error('Method not implemented.')
	}
	hydrate(data: object): void {
		throw new Error('Method not implemented.')
	}
}

export class PmSim implements Serializable {
	private tasks: Task[]
	private decisions: Decision[]
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
	}
	tick(currentTick: number) {
		const queues = this.tasks.reduce<Record<string, Task[]>>((acc, task) => {
			if (task.status === 'inProgress' && task.assignee) {
				acc[task.assignee] = acc[task.assignee] || []
				acc[task.assignee]?.push(task)
			}
			return acc
		}, {})
		this.tasks.forEach((task) => {
			if (task.assignee) {
				const activeTasks = queues[task.assignee]
				const noActiveTasks = !activeTasks || activeTasks.length === 0
				const canStart = task.reportDependencies().every((d) => isResolved(d))
				if (noActiveTasks && task.status === 'todo' && canStart) {
					if (activeTasks) {
						activeTasks!.push(task)
					} else {
						queues[task.assignee] = [task]
					}
					task.status = 'inProgress'
				}
			}
			task.tick(task.requiredAttention)
		})
		this.decisions.forEach((decision) => {
			decision.tick()
		})
	}
	getTasks(): Task[] {
		return this.tasks
	}

	serialize(): object {
		throw new Error('Method not implemented.')
	}
	hydrate(data: object): void {
		throw new Error('Method not implemented.')
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
