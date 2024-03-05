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
	abstract requiredAttention: AttentionSpan // to be overrode
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

export class TasksStore {
	private tasks: Task[] = []

	addTask(task: Task) {
		this.tasks.push(task)
	}
	getTasks() {
		return this.tasks
	}
	updateTasks(tick: number) {
		// for all tasks ensure that there is at least one task in progress,
		// if not, start the one with the highest priority (tasks are already sorted by priority)

		const queues: Record<string, Task[]> = {}
		for (const task of this.tasks) {
			const assignee = task.assignee
			if (!assignee) continue
			if (!queues[assignee]) queues[assignee] = [task]
			else queues[assignee].push(task)
		}
		Object.values(queues).forEach((queue) => {
			let hasInProgress = queue.some((task) => task.status === 'inProgress')
			queue.forEach((task, i) => {
				// if the task is in progress or done do not update wait time
				if (task.status !== 'inProgress' && task.status !== 'done') {
					// for each task calculate the wait time:
					// it equals to the sum of the wait time and max(timeSpent, estimatedTime)
					// of previous tasks with the same assignee
					if (i === 0) {
						task.wait = tick / scale
					} else {
						const prevTask = queue[i - 1]
						const prevTaskEnd = prevTask.wait + Math.max(prevTask.timeSpent, prevTask.estimate)
						task.wait = Math.max(prevTaskEnd, tick / scale)
					}
				}

				if (!hasInProgress) {
					if (task.status === 'todo') {
						task.status = 'inProgress'
						hasInProgress = true
					}
				}
				task.tick(tick)
			})
		})
	}

	clear() {
		this.tasks = []
	}

	serialize() {
		return this
	}
	hydrate(data: { tasks: any[] }) {
		this.tasks = data.tasks.map((taskData) => {
			const task = new Task('', 0)
			task.hydrate(taskData)
			return task
		})
	}
}
