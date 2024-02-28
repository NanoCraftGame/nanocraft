import { expect, describe, it, vi } from 'vitest'
import { Task, TasksStore } from './tasks'

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
			tasksStore.updateTasks()
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

			tasksStore.updateTasks()

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

			tasksStore.updateTasks()

			expect(task1.status).toEqual('todo')
			expect(task2.status).toEqual('inProgress')
			expect(task3.status).toEqual('todo')
		})

		it('should wait timeSpent if it is greater than estimatedTime', () => {
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

			task1.timeSpent = 12

			tasksStore.updateTasks()

			expect(task2.wait).toEqual(task1.timeSpent)
			expect(task3.wait).toEqual(task1.timeSpent + task2.estimatedTime)
		})
	})
})

describe('Task', () => {
	it('should update the task', () => {
		const task = new Task('task1', 1, 1)
		task.status = 'inProgress'
		task.update()
		expect(task.timeSpent).toBe(1 / 8)
	})
})
