// @ts-ignore
import probJs from 'prob.js'

function calculateRealTime(estimatedTime: number) {
	// system of equations:
	// mode = e^(μ−σ²)
	// percentile = e^(μ+σ*Z)
	const zScore = 2.326 // 99% confidence interval
	const mode = estimatedTime * 0.25 // 25% of the estimated time
	const percentile = estimatedTime * Math.PI // IBM's suggested estimate correction
	// this results to a quadratic equation σ^2 + 2.326σ − ln(percentile/mode) = 0
	const a = 1
	const b = zScore
	const c = -Math.log(percentile / mode)
	const d = b ** 2 - 4 * a * c
	const sigma1 = (-b + Math.sqrt(d)) / (2 * a)
	const sigma2 = (-b - Math.sqrt(d)) / (2 * a)
	const sigma = Math.max(sigma1, sigma2)
	const mu = Math.log(mode) + sigma ** 2
	const lognormal = probJs.lognormal(mu, sigma)
	const deviation = lognormal() - mode
	return Math.ceil(estimatedTime + deviation)
}
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

	update() {
		if (this.status === 'inProgress') {
			this.timeSpent += 1 / 8
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
	updateTasks() {
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
				// for each task calculate the wait time:
				// it equals to the sum of the wait time and max(timeSpent, estimatedTime)
				// of previous tasks with the same assignee
				if (i === 0) {
					task.wait = 0
				} else {
					const prevTask = queue[i - 1]
					task.wait = prevTask.wait + Math.max(prevTask.timeSpent, prevTask.estimatedTime)
				}

				if (!hasInProgress) {
					if (task.status === 'todo') {
						task.status = 'inProgress'
						hasInProgress = true
					}
				}
				task.update()
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
