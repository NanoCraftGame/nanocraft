import { expect, describe, it, vi } from 'vitest'
import { AttentionSpan, Dependable, Task, Decision, scale, PmSim } from './tasks'

class AnyTask extends Task {
	requiredAttention = AttentionSpan.FullAttention
}

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

describe('Decision', () => {
	it('unlocks when all dependencies are done', () => {
		const task1 = new AnyTask('task1', 5)
		const task2 = new AnyTask('task2', 5)
		const decision = new Decision('decision1', [])
		decision.dependsOn(task1)
		decision.dependsOn(task2)
		task1.status = 'done'
		task2.status = 'done'
		const onUnlockSpy = vi.fn()
		decision.onUnlock(onUnlockSpy)
		decision.tick()
		expect(onUnlockSpy).toBeCalledWith(decision)
	})

	it('makes all optional tasks dormat and dependant on it', () => {
		const task1 = new AnyTask('task1', 5)
		const task2 = new AnyTask('task2', 5)
		const taks1spy = vi.spyOn(task1, 'setDormant')
		const taks2spy = vi.spyOn(task2, 'setDormant')
		const decision = new Decision('decision1', [
			{ task: task1, description: 'desc1' },
			{ task: task2, description: 'desc2' },
		])
		expect(taks1spy).toBeCalled()
		expect(taks2spy).toBeCalled()
		expect(task1.reportDependencies()).toEqual([decision])
		expect(task2.reportDependencies()).toEqual([decision])
	})

	it('awakens a selected task', () => {
		const task1 = new AnyTask('task1', 5)
		const task2 = new AnyTask('task2', 5)
		const decision = new Decision('decision1', [
			{ task: task1, description: 'desc1' },
			{ task: task2, description: 'desc2' },
		])
		const spy = vi.spyOn(task1, 'awake')

		decision.decide(decision.options[0]!)

		expect(spy).toBeCalled()
		expect(decision.status).toBe('done')
	})

	describe('serialize', () => {
		it.todo('serializes a decision')
		it.todo('hydrates a decision')
	})
})

describe('Task', () => {
	describe('serialize', () => {
		it('serializes a task', () => {
			const task = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const task3 = new AnyTask('task3', 5)
			task2.dependsOn(task)
			task.dependsOn(task3)
			expect(task.serialize()).toEqual({
				type: 'AnyTask',
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

		it.todo('hydrates a task')
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

	describe('dormant taks', () => {
		it('awakens', () => {
			const task = new AnyTask('task1', 5)
			task.isDormant = true
			task.awake()
			expect(task.isDormant).toBe(false)
		})
		it('sets itself dormant', () => {
			const task = new AnyTask('task1', 5)
			task.isDormant = false
			task.setDormant()
			expect(task.isDormant).toBe(true)
		})
		it('cannot be assigned if dormant', () => {
			const task = new AnyTask('task1', 5)
			task.isDormant = true
			task.assign('user1')
			expect(task.assignee).toBe(null)
		})

		it('recursively sets dependents dormant', () => {
			const task = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const taks2spy = vi.spyOn(task2, 'setDormant')
			task2.dependsOn(task)
			task.setDormant()
			expect(taks2spy).toBeCalled()
		})

		it('recursively awakens dependents', () => {
			const task = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const taks2spy = vi.spyOn(task2, 'awake')
			task2.dependsOn(task)
			task.setDormant()
			task.awake()
			expect(taks2spy).toBeCalled()
		})
	})
})

describe('PmSim', () => {
	describe('Graph registration', () => {
		it('detetcts a cycle', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const task3 = new AnyTask('task3', 5)
			const decision = new Decision('decision1', [{ task: task2, description: 'desc1' }])
			decision.dependsOn(task1)
			task3.dependsOn(task2)
			task1.dependsOn(task3)
			const pm = new PmSim()
			expect(() => pm.registerGraph([task3])).toThrow('Cycle depencies in taks graph')
		})
	})
	describe('Getting tasks', () => {
		it('returns tasks', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const task3 = new AnyTask('task3', 5)
			const decision = new Decision('decision1', [{ task: task2, description: 'desc1' }])
			decision.dependsOn(task1)
			task3.dependsOn(task2)
			const pm = new PmSim()
			pm.registerGraph([task1])
			const expected = [task1, task2, task3]
			expect(pm.getTasks()).toEqual(expected)
		})
		it('returns all tasks in topological order', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const task3 = new AnyTask('task3', 5)
			const task4 = new AnyTask('task4', 5)
			const task5 = new AnyTask('task5', 5)
			const task6 = new AnyTask('task6', 5)
			const task7 = new AnyTask('task7', 5)
			const decision = new Decision('decision1', [
				{ task: task3, description: 'desc1' },
				{ task: task4, description: 'desc2' },
			])
			decision.dependsOn(task1)
			decision.dependsOn(task2)
			task5.dependsOn(task3)
			task6.dependsOn(task4)
			task7.dependsOn(task5)
			task7.dependsOn(task6)
			const pm = new PmSim()
			pm.registerGraph([task3])
			const allTasks = [task1, task2, task3, task4, task5, task6, task7]
			const reportedTasks = pm.getTasks()
			// 1. getTasks should return all tasks included in allTasks
			// the order may differ
			for (const task of allTasks) {
				expect(reportedTasks).toContain(task)
			}
			// 2. for each task, all its dependencies should come before it
			reportedTasks.forEach((task, i) => {
				const deps = task.reportDependencies()
				deps.forEach((dep) => {
					// @ts-ignore
					expect(reportedTasks.indexOf(dep)).toBeLessThan(i)
				})
			})
		})
		it('returns tasks from disconnected graphs', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const task3 = new AnyTask('task3', 5)
			const task4 = new AnyTask('task4', 5)
			const allTasks = [task1, task2, task3, task4]
			task2.dependsOn(task1)
			task4.dependsOn(task3)
			const pm = new PmSim()
			pm.registerGraph([task1, task3])
			const reportedTasks = pm.getTasks()
			for (const task of allTasks) {
				expect(reportedTasks).toContain(task)
			}
		})
	})
})

function printTasks(expected: any[], actual: any[]) {
	console.log('Expected:', expected.map((t) => t.name).join(', '))
	console.log('Actual:  ', actual.map((t) => t.name).join(', '))
}
