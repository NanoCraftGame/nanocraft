export class Task {
	/** id of the crew member assigned to the task */
	assignee: string | null = null
	name: string
	description = ''
	status: 'todo' | 'inProgress' | 'done' | 'canceled' | 'blocked' = 'todo'
	priority: number
	estimatedTime: number
	timeSpent = 0
	wait = 0
	private realTime: number

	constructor(name: string, priority: number, estimatedTime: number) {
		this.name = name
		this.priority = priority
		this.estimatedTime = estimatedTime
		this.realTime = estimatedTime // TODO here go all that shenanigans with the lognormal distribution
	}

	assign(assignee: string) {
		this.assignee = assignee
	}

	update() {
		if (this.status === 'inProgress') {
			this.timeSpent++
		}
		if (this.timeSpent >= this.realTime) {
			this.status = 'done'
		}
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
			queue.forEach((task, i) => {
				const hasInProgress = queue.some((task) => task.status === 'inProgress')
				if (hasInProgress) return
				if (i === 0 && task.status === 'todo') {
					task.status = 'inProgress'
					return
				} else if (i > 0 && task.status === 'todo') {
					task.status = 'inProgress'
					return
				}
			})
		})
		this.tasks.forEach((task) => {
			task.update()
		})
	}
}
