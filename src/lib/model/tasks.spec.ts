import { expect, describe, it, vi } from 'vitest'
import { AttentionSpan, Dependable, Task, TasksStore, scale } from './tasks'

describe('TasksStore', () => {
	it('should add a task', () => {
		const tasksStore = new TasksStore()
		tasksStore.addTask(new Task('task1', 1))
		expect(tasksStore.getTasks().length).toBe(1)
	})

	describe('updateTasks: wait times and queues', () => {
		it('runs update on each assigned task', () => {
			const tasksStore = new TasksStore()
			const task1 = new Task('task1', 5)
			const task2 = new Task('task2', 10)
			const task3 = new Task('task3', 12)
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
			const task1 = new Task('task1', 5)
			const task2 = new Task('task2', 10)
			const task3 = new Task('task3', 12)
			const task4 = new Task('task4', 8)
			const task5 = new Task('task5', 12)
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
			const task1 = new Task('task1', 5)
			const task2 = new Task('task2', 10)
			const task3 = new Task('task3', 12)
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
				task1 = new Task('task1', 5)
				task2 = new Task('task2', 10)
				task3 = new Task('task3', 12)
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
			} while (task1.timeSpent < task1.estimate)

			expect(task2.wait).toEqual(task1.timeSpent)
			expect(task3.wait).toEqual(task1.timeSpent + task2.estimate)
		})

		it('should not have wait time less then current tick', () => {
			const tick = 20
			const tasksStore = new TasksStore()
			const task0 = new Task('task0', 1)
			const task1 = new Task('task1', 5)
			const task2 = new Task('task2', 5)

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
			const task1 = new Task('task1', 5)
			const task2 = new Task('task2', 10)
			const task3 = new Task('task3', 12)
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

	describe('tasks dependencies', () => {
		it('align tasks according to their dependencies', () => {
			const tasksStore = new TasksStore()
			const task1 = new Task('task1', 5)
			const task2 = new Task('task2', 10)
			const task3 = new Task('task3', 12)
			const task4 = new Task('task4', 8)
			const task5 = new Task('task5', 12)
			task2.dependOn(task1)
			task3.dependOn(task2)
			task5.dependOn(task4)
			tasksStore.addTask(task1)
			tasksStore.addTask(task2)
			tasksStore.addTask(task3)
			tasksStore.addTask(task4)
			tasksStore.addTask(task5)

			tasksStore.updateTasks(0)

			expect(task1.wait).toEqual(0)
			expect(task2.wait).toEqual(task1.estimatedTime)
			expect(task3.wait).toEqual(task2.estimatedTime + task2.wait)
			expect(task4.wait).toEqual(0)
			expect(task5.wait).toEqual(task4.estimatedTime)
		})
	})
})

describe('Dependable', () => {
	it('should have a method dependOn', () => {
		const task = new Dependable('task1')
		expect(task.dependsOn).toBeInstanceOf(Function)
	})

	it('reports its dependencies by dependsOn', () => {
		const task1 = new Dependable('task1')
		const task2 = new Dependable('task2')
		task2.dependsOn(task1)
		expect(task2.reportDependencies()).toEqual([task1])
	})

	it('reports its dependents by dependsOn', () => {
		const task1 = new Dependable('task1')
		const task2 = new Dependable('task2')
		task2.dependsOn(task1)
		expect(task1.reportDependents()).toEqual([task2])
	})

	it('reports its dependencies by neededFor', () => {
		const task1 = new Dependable('task1')
		const task2 = new Dependable('task2')
		task2.neededFor(task1)
		expect(task1.reportDependencies()).toEqual([task2])
	})

	it('reports its dependents by neededFor', () => {
		const task1 = new Dependable('task1')
		const task2 = new Dependable('task2')
		task2.neededFor(task1)
		expect(task2.reportDependents()).toEqual([task1])
	})
})

describe('Task', () => {
	class AnyTask extends Task {
		requiredAttention = AttentionSpan.FullAttention
	}
	describe('serialize', () => {
		it('should serialize a task', () => {
			const task = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const task3 = new AnyTask('task3', 5)
			task2.dependsOn(task)
			task.dependsOn(task3)
			expect(task.serialize()).toEqual({
				id: task.id,
				name: 'task1',
				estimatedTime: 5,
				attentionSpan: 1,
				isDormant: false,
				status: 'todo',
				realTime: expect.any(Number),
				dependencies: [task3.id],
				dependents: [task2.id],
			})
		})

		it.todo('should hydrate a task')
	})

	describe('assign', () => {
		it('assigns a task to a user', () => {
			const task = new AnyTask('task1', 5)
			task.assign('user1')
			expect(task.assignee).toEqual('user1')
		})
	})

	describe('tick', () => {
		it('increases timeSpent by n * scale', () => {
			const task = new AnyTask('task1', 5)
			task.assign('user1')
			task.status = 'inProgress'
			task.tick(1)
			expect(task.timeSpent).toEqual(1 * scale)
			task.tick(0.8)
			expect(task.timeSpent).toEqual(1 * scale + 0.8 * scale)
		})
		it('transitions task to done state if time spent exceeds real time', () => {
			const task = new AnyTask('task1', 5)
			task.assign('user1')
			task.status = 'inProgress'

			// Simulate ticks, 5*4 ticks should be enough to exceed real time
			// since 0.99 confidence level is 5 * 3.14
			const enoughTicks = (5 * 5) / scale
			for (let i = 0; i < enoughTicks; i++) {
				task.tick(1)
			}

			expect(task.status).toEqual('done')
		})

		it('does notihng if task is not in progress', () => {
			const task = new AnyTask('task1', 5)
			task.assign('user1')
			task.status = 'todo'
			task.tick(1)
			expect(task.timeSpent).toEqual(0)
		})
	})
})
