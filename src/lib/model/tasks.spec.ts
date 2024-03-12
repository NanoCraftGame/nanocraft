import { expect, describe, it, vi } from 'vitest'
import { AttentionSpan, Dependable, Task, Decision, scale, PmSim } from './tasks'
import { Character } from './character'

class AnyTask extends Task {
	requiredAttention = AttentionSpan.FullAttention
}
class EasyTask extends Task {
	requiredAttention = AttentionSpan.PartialAttention
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

	it.todo("doesn't duplicate dependency")
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

	describe('serialization', () => {
		it('serializes a decision', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const decision = new Decision('decision1', [{ task: task1, description: 'desc1' }])
			decision.dependsOn(task2)
			expect(decision.serialize()).toEqual({
				type: 'Decision',
				id: decision.id,
				report: 'decision1',
				options: [{ task: task1.id, description: 'desc1' }],
				status: 'todo',
				dependencies: [task2.id],
				dependents: [task1.id],
			})
		})
		it('hydrates a decision', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const decision = new Decision('decision1', [{ task: task1, description: 'desc1' }])
			const registry = {
				[task1.id]: task1,
				[task2.id]: task2,
				[decision.id]: decision,
			}
			decision.dependsOn(task2)
			const serialised = decision.serialize() as any
			serialised.dependencies = serialised.dependencies.map((id: string) => registry[id])
			serialised.options = serialised.options.map((option: any) => {
				option.task = registry[option.task]
				return option
			})
			const hydrated = new Decision('', []).hydrate(serialised)
			expect(hydrated).toBeInstanceOf(Decision)
			expect(hydrated.id).toEqual(decision.id)
			expect(hydrated.report).toEqual(decision.report)
			expect(hydrated.status).toEqual(decision.status)
			expect(hydrated.options).toEqual(decision.options)
			expect(hydrated.dependencies).toEqual(decision.dependencies)
			expect(hydrated.dependents).toEqual(decision.dependents)
		})
	})
})

describe('Task', () => {
	describe('serialization', () => {
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
				estimate: 5,
				isDormant: false,
				waitTime: task.waitTime,
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

	describe('duration', () => {
		it('is an estimate when task is in todo', () => {
			const task = new AnyTask('task1', 5)
			expect(task.duration).toEqual(5)
		})
		it('is time spent, when task is inProgress and time spent is bigger', () => {
			let task: Task
			// we don't know the realTime, so let simulate  and find first
			// task that takes longer than its estimate
			while (true) {
				task = new AnyTask('task1', 1)
				task.status = 'inProgress'
				do {
					task.tick(1)
					// break as soon as time spent exceeds estimate
					if (task.estimate < task.timeSpent) break
					// but don't run it forever, when it's done
				} while (task.status === 'inProgress')
				// if we got here because of previous break, not because the
				// task is done – that's what we've been searching for
				if (task.status === 'inProgress') break
			}
			expect(task.duration).toEqual(task.timeSpent)
		})
		it('is estimate, when task is inProgress and time spent is smaller', () => {
			const task = new AnyTask('task1', 5)
			task.status = 'inProgress'
			task.tick(1)
			expect(task.duration).toEqual(5)
		})
		it('is time spent, when task is done', () => {
			const task = new AnyTask('task1', 5)
			task.status = 'done'
			task.timeSpent = 2
			expect(task.duration).toEqual(2)
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
	describe('ticking', () => {
		it('calls ticks for all ndoes of a graph', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const decision = new Decision('decision1', [{ task: task2, description: 'desc1' }])
			decision.dependsOn(task1)
			const pm = new PmSim()
			pm.registerGraph([task1])
			const tickSpy1 = vi.spyOn(task1, 'tick')
			const tickSpy2 = vi.spyOn(task2, 'tick')
			const tickSpy3 = vi.spyOn(decision, 'tick')
			pm.tick(1)
			expect(tickSpy1).toBeCalled()
			expect(tickSpy2).toBeCalled()
			expect(tickSpy3).toBeCalled()
		})
		describe('transitions to `inProgress`', () => {
			it('next TODO task in assingee queue', () => {
				const task1 = new AnyTask('task1', 5)
				const task2 = new AnyTask('task2', 5)
				task1.assign('user1')
				task2.assign('user1')
				task1.status = 'done'
				const pm = new PmSim()
				pm.registerGraph([task1, task2])
				pm.tick(1)
				expect(task2.status).toBe('inProgress')
			})
			it('moves tasks for several users', () => {
				const task1 = new AnyTask('task1', 5)
				const task2 = new AnyTask('task2', 5)
				task1.assign('user1')
				task2.assign('user2')
				const pm = new PmSim()
				pm.registerGraph([task1, task2])
				pm.tick(1)
				expect(task1.status).toBe('inProgress')
				expect(task2.status).toBe('inProgress')
			})
			it.todo('transitions _before_ tick call')
			it('unless a task has unresolved dependencies', () => {
				const task1 = new AnyTask('task1', 5)
				const task2 = new AnyTask('task2', 5)
				task2.dependsOn(task1)
				task2.assign('user1')
				const pm = new PmSim()
				pm.registerGraph([task1])
				pm.tick(1)
				expect(task2.status).toBe('todo')
			})
			it('several part.-att. tasks', () => {
				const task1 = new EasyTask('task1', 5)
				const task2 = new EasyTask('task2', 5)
				task1.assign('user1')
				task2.assign('user1')
				const pm = new PmSim()
				pm.registerGraph([task1, task2])
				pm.tick(1)
				expect(task1.status).toBe('inProgress')
				expect(task2.status).toBe('inProgress')
			})
			it('<= 5 part.-att. tasks', () => {
				const tasks: Task[] = []
				for (let i = 0; i < 6; i++) {
					const task = new EasyTask(`task${i}`, 5)
					task.assign('user1')
					tasks.push(task)
				}
				const pm = new PmSim()
				pm.registerGraph(tasks)
				pm.tick(1)
				const inProgress = tasks.filter((t) => t.status === 'inProgress')
				const todo = tasks.filter((t) => t.status === 'todo')
				expect(inProgress.length).toBe(5)
				expect(todo.length).toBe(1)
			})
			it('<= 3 part.-att. tasks if a full-att. task is in prog.', () => {
				const tasks: Task[] = []
				for (let i = 0; i < 4; i++) {
					const task = new EasyTask(`task${i}`, 5)
					task.assign('user1')
					tasks.push(task)
				}
				const task = new AnyTask('task5', 5)
				task.status = 'inProgress'
				task.assign('user1')
				tasks.push(task)
				const pm = new PmSim()
				pm.registerGraph(tasks)
				pm.tick(1)
				const inProgress = tasks.filter((t) => t.status === 'inProgress')
				const todo = tasks.filter((t) => t.status === 'todo')
				expect(inProgress.length).toBe(4)
				expect(todo.length).toBe(1)
			})
			it('only 1 full-att. task', () => {
				const task1 = new AnyTask('task1', 5)
				const task2 = new AnyTask('task2', 5)
				task1.assign('user1')
				task2.assign('user1')
				task1.status = 'inProgress'
				const pm = new PmSim()
				pm.registerGraph([task1, task2])
				pm.tick(1)
				expect(task2.status).toBe('todo')
			})
			it.todo('no full-att. task if there are > 3 part.-att. tasks in prog.')
		})
		it('calls tasks tick with available attention span', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new EasyTask('task2', 5)
			const task3 = new EasyTask('task3', 5)
			task1.assign('user1')
			task1.status = 'inProgress'
			task2.assign('user1')
			task2.status = 'inProgress'
			task3.assign('user1')
			task3.status = 'inProgress'
			const pm = new PmSim()
			pm.registerGraph([task1, task2, task3])

			const tickSpy1 = vi.spyOn(task1, 'tick')
			const tickSpy2 = vi.spyOn(task2, 'tick')
			const tickSpy3 = vi.spyOn(task3, 'tick')
			pm.tick(1)
			expect(tickSpy1).toBeCalledWith(0.8)
			expect(tickSpy2).toBeCalledWith(0.1)
			expect(tickSpy3).toBeCalledWith(0.1)
		})
	})
	describe('wait time calculation', () => {
		it('is 0 for the first time in queue', () => {
			const task1 = new AnyTask('task1', 5)
			task1.assign('user1')
			const pm = new PmSim()
			pm.registerGraph([task1])
			pm.tick(0)
			expect(task1.waitTime).toBe(0)
		})
		it('is not changing for done tasks', () => {
			const task1 = new AnyTask('task1', 5)
			task1.assign('user1')
			task1.status = 'done'
			task1.waitTime = 42
			const pm = new PmSim()
			pm.registerGraph([task1])
			pm.tick(1)
			expect(task1.waitTime).toBe(42)
		})
		it('is a end of a prev. task in queue for second task', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			task1.assign('user1')
			task1.waitTime = 11
			// we use 'done' and time spent to prove that the duration used,
			// not estimate
			task1.status = 'done'
			task1.timeSpent = 4
			task2.assign('user1')
			const pm = new PmSim()
			// TODO here is the problem with ordering taks.
			// There is no guarantee that 'done' taks is before 'todo' task
			// in the queue, because sorting takes into account only dependencies
			pm.registerGraph([task2, task1])
			pm.tick(1)
			expect(task2.waitTime).toBe(task1.waitTime + task1.duration)
		})
		it('is latest end of dependencies', () => {
			const task1 = new AnyTask('task1', 3)
			const task2 = new AnyTask('task2', 4)
			const task3 = new AnyTask('task3', 5)
			task1.waitTime = 3
			task1.timeSpent = 4
			task1.status = 'done' // pervent from ticking
			task3.dependsOn(task2)
			task3.dependsOn(task1)
			const pm = new PmSim()
			pm.registerGraph([task3])
			pm.tick(1)
			expect(task3.waitTime).toBe(task1.waitTime + task1.duration)
		})
		it('is end of prev. task if it is later', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const task3 = new AnyTask('task3', 5)
			task1.assign('user1')
			task1.waitTime = 11
			task1.status = 'done'
			task1.timeSpent = 4
			task3.assign('user1')
			task2.waitTime = 10
			task3.dependsOn(task2)
			const pm = new PmSim()
			pm.registerGraph([task2, task1])
			pm.tick(1)
			expect(task3.waitTime).toBe(task1.waitTime + task1.duration)
		})
		it('is not less then current tick * scale', () => {
			const task1 = new AnyTask('task1', 5)
			const pm = new PmSim()
			pm.registerGraph([task1])
			pm.tick(128)
			task1.assign('user1')
			pm.tick(128)
			expect(task1.waitTime).toBe(128 * scale)
		})
	})
	describe('tasks assignment', () => {
		it('assigns task if a character can take it', () => {
			const task1 = new AnyTask('task1', 5)
			class CharacterStub extends Character {
				id = 'user1'
				canTake = vi.fn().mockReturnValue(true)
			}
			const pm = new PmSim()
			const character = new CharacterStub({
				id: 'user1',
				name: 'User 1',
				description: 'User 1',
				image: 'unnamed',
			})
			const assignSpy = vi.spyOn(task1, 'assign')
			pm.registerGraph([task1])
			pm.assign(character, task1)
			expect(assignSpy).toBeCalledWith('user1')
			expect(character.canTake).toBeCalledWith(task1)
		})
	})
	describe('decsison subscription', () => {
		it('subscribes a decsison callback to all decisions', () => {
			const decision = new Decision('decision1', [])
			const decision2 = new Decision('decision1', [])
			const pm = new PmSim()
			const spy1 = vi.spyOn(decision, 'onUnlock')
			const spy2 = vi.spyOn(decision2, 'onUnlock')
			const fn = vi.fn()
			pm.registerGraph([decision, decision2])
			pm.onDecisionUnlocked(fn)
			expect(spy1).toBeCalledWith(fn)
			expect(spy2).toBeCalledWith(fn)
		})
	})

	describe('serialization', () => {
		it('serializes a pm', () => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new AnyTask('task2', 5)
			const decision = new Decision('decision1', [{ task: task2, description: 'desc1' }])
			decision.dependsOn(task1)
			const pm = new PmSim()
			pm.registerGraph([task1])
			expect(pm.serialize()).toEqual({
				type: 'PmSim',
				tasks: [task1.serialize(), task2.serialize()],
				decisions: [decision.serialize()],
			})
		})
		it('hydrates a pm', (done) => {
			const task1 = new AnyTask('task1', 5)
			const task2 = new EasyTask('task2', 5)
			const decision = new Decision('decision1', [{ task: task2, description: 'desc1' }])
			decision.dependsOn(task1)
			const pm = new PmSim()
			pm.registerGraph([task1, task2])
			const hydrated = new PmSim()
			hydrated.setTaskFactory((type) => {
				if (type === 'AnyTask') return new AnyTask('', 0)
				if (type === 'EasyTask') return new EasyTask('', 0)
				throw new Error('Unknown task type')
			})
			hydrated.hydrate(pm.serialize())
			expect(hydrated).toBeInstanceOf(PmSim)
			expect(hydrated.getTasks()).toEqual(pm.getTasks())
			// TODO check that tasks are of correct types also
			const onUnlock = vi.fn()
			hydrated.onDecisionUnlocked(onUnlock)
			pm.onDecisionUnlocked(onUnlock)
			hydrated.getTasks().forEach((t) => (t.status = 'done'))
			pm.getTasks().forEach((t) => (t.status = 'done'))
			hydrated.tick(1)

			expect(onUnlock).toBeCalledWith(decision)
		})
	})
})

function printTasks(expected: any[], actual: any[]) {
	console.log('Expected:', expected.map((t) => t.name).join(', '))
	console.log('Actual:  ', actual.map((t) => t.name).join(', '))
}
