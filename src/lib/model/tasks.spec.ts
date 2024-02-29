import { expect, describe, it, vi } from 'vitest'
import { Task, TasksStore, scale } from './tasks'

describe('TasksStore', () => {
	it('should add a task', () => {
		const tasksStore = new TasksStore()
		tasksStore.addTask(new Task('task1', 1, 1))
		expect(tasksStore.getTasks().length).toBe(1)
	})

	describe('updateTasks: wait times and queues', () => {
		it('runs update on each assigned task', () => {
			const tasksStore = new TasksStore()
			const task1 = new Task('task1', 1, 5)
			const task2 = new Task('task2', 2, 10)
			const task3 = new Task('task3', 3, 12)
			task1.assign('user1')
			task2.assign('user1')
			task3.assign('user1')
			tasksStore.addTask(task1)
			tasksStore.addTask(task2)
			tasksStore.addTask(task3)
			const spy1 = vi.spyOn(task1, 'update')
			const spy2 = vi.spyOn(task2, 'update')
			const spy3 = vi.spyOn(task3, 'update')
			tasksStore.updateTasks(0)
			expect(spy1).toHaveBeenCalled()
			expect(spy2).toHaveBeenCalled()
			expect(spy3).toHaveBeenCalled()
		})

		it('should wait previous tasks assigned to the same user', () => {
			const tasksStore = new TasksStore()

			// Create tasks and assign them to two different users
			const task1 = new Task('task1', 1, 5)
			const task2 = new Task('task2', 2, 10)
			const task3 = new Task('task3', 3, 12)
			const task4 = new Task('task4', 4, 8)
			const task5 = new Task('task5', 5, 12)
			// assign tasks to user1
			task1.assign('user1')
			task3.assign('user1')
			// assign tasks to user2
			task2.assign('user2')
			task4.assign('user2')
			task5.assign('user2')
			tasksStore.addTask(task1)
			tasksStore.addTask(task2)
			tasksStore.addTask(task3)
			tasksStore.addTask(task4)
			tasksStore.addTask(task5)

			tasksStore.updateTasks(0)

			// Check that the first task for each user is 'inProgress'
			expect(task1.status).toEqual('inProgress')
			expect(task2.status).toEqual('inProgress')

			// Check that the second task for each user has wait
			// time equals to the estimated time of the previous task
			expect(task3.wait).toEqual(task1.estimatedTime)
			expect(task4.wait).toEqual(task2.estimatedTime)
			expect(task5.wait).toEqual(task2.estimatedTime + task4.estimatedTime)
		})

		it('should not start not assigned tasks', () => {
			const tasksStore = new TasksStore()
			const task1 = new Task('task1', 1, 5)
			const task2 = new Task('task2', 2, 10)
			const task3 = new Task('task3', 3, 12)
			task2.assign('user1')
			task3.assign('user1')
			tasksStore.addTask(task1)
			tasksStore.addTask(task2)
			tasksStore.addTask(task3)

			tasksStore.updateTasks(0)

			expect(task1.status).toEqual('todo')
			expect(task2.status).toEqual('inProgress')
			expect(task3.status).toEqual('todo')
		})

		it('should wait timeSpent if it is greater than estimatedTime', () => {
			const tasksStore = new TasksStore()
			// since we don't know the real time assigned to the task at its creation
			// we will create a task and update it _until_ we hit one that
			// has timeSpent greater than estimatedTime
			let task1: Task
			let task2: Task
			let task3: Task
			do {
				let i = 0
				task1 = new Task('task1', 1, 5)
				task2 = new Task('task2', 2, 10)
				task3 = new Task('task3', 3, 12)
				task1.assign('user1')
				task2.assign('user1')
				task3.assign('user1')
				tasksStore.addTask(task1)
				tasksStore.addTask(task2)
				tasksStore.addTask(task3)
				while (task1.status !== 'done') {
					tasksStore.updateTasks(i)
					i++
				}
			} while (task1.timeSpent < task1.estimatedTime)

			expect(task2.wait).toEqual(task1.timeSpent)
			expect(task3.wait).toEqual(task1.timeSpent + task2.estimatedTime)
		})

		it('should not have wait time less then current tick', () => {
			const tick = 20
			const tasksStore = new TasksStore()
			const task0 = new Task('task0', 1, 1)
			const task1 = new Task('task1', 1, 5)
			const task2 = new Task('task2', 1, 5)

			task0.assign('user1')
			tasksStore.addTask(task0)
			tasksStore.addTask(task1)
			tasksStore.addTask(task2)
			tasksStore.updateTasks(0)

			task1.assign('user1')
			task2.assign('user1')
			tasksStore.updateTasks(tick)

			expect(task1.wait).toEqual(tick / scale)
			expect(task2.wait).toEqual(task1.estimatedTime + task1.wait)
		})

		it('should not update wait for inProgress and done tasks', () => {
			const tasksStore = new TasksStore()
			const task1 = new Task('task1', 1, 5)
			const task2 = new Task('task2', 2, 10)
			const task3 = new Task('task3', 3, 12)
			task1.assign('user1')
			task2.assign('user1')
			task3.assign('user1')
			tasksStore.addTask(task1)
			tasksStore.addTask(task2)
			tasksStore.addTask(task3)

			task1.status = 'inProgress'
			task2.status = 'todo'
			task3.status = 'done'

			tasksStore.updateTasks(12)

			expect(task1.wait).toEqual(0)
			expect(task2.wait).toEqual(task1.estimatedTime)
			expect(task3.wait).toEqual(0)
		})
	})
})

describe('Task', () => {
	it('should update the task', () => {
		const task = new Task('task1', 1, 5)
		task.status = 'inProgress'
		task.wait = 4
		task.update(12)
		expect(task.timeSpent).toBe(12 / scale - 4)
	})
	it('should be done when timeSpent is greater than realTime (unknown)', () => {
		const task = new Task('task1', 1, 5)
		task.status = 'inProgress'
		// since 99 percentile of realTime is 5 * PI = 15.7,
		//  30 * 8 is guaranteed to be greater
		task.update(30 * 8)
		expect(task.status).toBe('done')
	})
})
