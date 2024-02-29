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

export const scale = 8 // one tick = 1 day, 1 day has 8 working hours

let counter = 0

export type Status = 'todo' | 'inProgress' | 'done' | 'canceled' | 'blocked'

export class Task {
	/** id of the crew member assigned to the task */
	assignee: string | null = null
	name: string
	id: string
	description = ''
	status: Status = 'todo'
	priority: number
	estimatedTime: number
	timeSpent = 0
	wait = 0
	private realTime: number
	dependencies: string[] = []

	constructor(name: string, priority: number, estimatedTime: number) {
		this.id = String(counter++)
		this.name = name
		this.priority = priority
		this.estimatedTime = estimatedTime
		this.realTime = calculateRealTime(estimatedTime)
	}

	assign(assignee: string) {
		this.assignee = assignee
	}

	update(tick: number) {
		if (this.status === 'inProgress') {
			this.timeSpent = tick / scale - this.wait
		}
		if (this.timeSpent >= this.realTime) {
			this.status = 'done'
		}
	}

	dependOn(task: Task) {
		this.dependencies.push(task.id)
	}

	serialize() {
		return this
	}
	hydrate(data: object) {
		Object.entries(data).forEach(([key, value]) => {
			if (!(key in this)) throw new Error(`Hydration error: unexpected key ${key}`)
			// @ts-ignore
			this[key] = value
		})
	}
}

export class TasksStore {
	private tasks: Task[] = []

	addTask(task: Task) {
		this.tasks.push(task)

		this.tasks.sort((a, b) => a.priority - b.priority)
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
						const prevTaskEnd = prevTask.wait + Math.max(prevTask.timeSpent, prevTask.estimatedTime)
						task.wait = Math.max(prevTaskEnd, tick / scale)
					}
				}

				if (!hasInProgress) {
					if (task.status === 'todo') {
						task.status = 'inProgress'
						hasInProgress = true
					}
				}
				task.update(tick)
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
			const task = new Task('', 0, 0)
			task.hydrate(taskData)
			return task
		})
	}
}
