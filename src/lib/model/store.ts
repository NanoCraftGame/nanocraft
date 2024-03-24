import { CharacterFactory } from './character'
import { MaterialFactory } from './material'
import { Project } from './project'
import { Timer } from './timer'
import { AttentionSpan, Decision, PmSim, Task } from './tasks'
import { browser } from '$app/environment'

const project = new Project(new MaterialFactory(), new CharacterFactory())
const pmSim = new PmSim()
const timer = new Timer()
let settings = {
	tempo: 10,
}

if (browser) {
	project.hydrate(JSON.parse(localStorage.getItem('project') || '{}'))
	if (pmSim.getTasks().length === 0) {
		const stored = localStorage.getItem('tasks')
		if (stored) {
			try {
				pmSim.hydrate(JSON.parse(stored))
			} catch (e) {
				console.error("Couldn't load tasks from localStorage", e)
				localStorage.removeItem('tasks')
			}
		}
	}
	settings = JSON.parse(localStorage.getItem('settings') || '{"tempo":10}')
	timer.setTempo(settings.tempo)
	const tick = JSON.parse(localStorage.getItem('tick') || '0')
	timer.setTick(tick)
	pmSim.tick(tick)
	pmSim.subscribe(notify)
	timer.onTick((tick) => {
		pmSim.tick(tick)
		save(tick)
	})
}

function save(tick: number) {
	localStorage.setItem('project', JSON.stringify(project.serialize()))
	localStorage.setItem('tasks', JSON.stringify(pmSim.serialize()))
	localStorage.setItem('settings', JSON.stringify(settings))
	localStorage.setItem('tick', JSON.stringify(tick))
}

type Store = typeof store
type Subscriber = (store: Store) => void

const subscribers: Subscriber[] = []

function notify() {
	subscribers.forEach((subscriber) => subscriber(store))
}
let tasksTypes: Record<string, TaskType> = {}
let tasks: TaskRecord[] = []

export const store = {
	settings,
	project,
	pmSim,
	timer,
	save,
	setTasksGraph(_tasksTypes: Record<string, TaskType>, _tasks: TaskRecord[]) {
		tasksTypes = _tasksTypes
		tasks = _tasks

		if (pmSim.getTasks().length === 0) {
			this.reset()
		}
	},
	subscribe(subscriber: Subscriber) {
		subscribers.push(subscriber)
	},
	reset(all: boolean = false) {
		if (all) {
			project.setMaterial(null)
			project.setPlayer(null)
			project.setColleague(null)
		}
		pmSim.clear()
		taskRegistry.clear()
		decisionRegistry.clear()
		const tasksGraph = initTasks(tasksTypes, tasks)

		pmSim.registerGraph(tasksGraph)
		timer.setTick(0)
		pmSim.tick(0)
		save(0)
	},
}

interface TaskType {
	requiredAttention: 'full' | 'partial'
}

interface OptionRecord {
	name: string
	downstream: TaskRecord[]
}

interface DecisionRecord {
	type: 'Decision'
	name: string
	report: string
	options: OptionRecord[]
}

interface TaskRecord {
	name: string
	type: string
	description: string
	estimate: number
	downstream?: Array<TaskRecord | DecisionRecord>
}

function initTasks(tasksTypes: Record<string, TaskType>, tasks: TaskRecord[]) {
	return tasks.map((taskRecord) => createTask(tasksTypes, taskRecord))
}

const taskRegistry = new Map<string, Task>()
const decisionRegistry = new Map<string, Decision>()

function createTask(taskTypes: Record<string, TaskType>, taskRecord: TaskRecord) {
	if (taskRegistry.has(taskRecord.name)) {
		return taskRegistry.get(taskRecord.name)!
	}
	const taskType = taskTypes[taskRecord.type] || { requiredAttention: 'full' }
	const attentionSpan =
		taskType.requiredAttention === 'full'
			? AttentionSpan.FullAttention
			: AttentionSpan.PartialAttention
	const task = new Task(
		taskRecord.name,
		taskRecord.estimate,
		taskRecord.type,
		attentionSpan,
		taskRecord.description,
	)
	if (taskRecord.downstream) {
		taskRecord.downstream.forEach((downstreamItem) => {
			if (isDecisionRecord(downstreamItem)) {
				let decision: Decision

				if (decisionRegistry.has(downstreamItem.name)) {
					decision = decisionRegistry.get(downstreamItem.name)!
				} else {
					const options = downstreamItem.options.map((option) => ({
						description: option.name,
						tasks: option.downstream.map((downstreamTask) => createTask(taskTypes, downstreamTask)),
					}))
					decision = new Decision(downstreamItem.report, options)
				}
				decision.dependsOn(task)
				decisionRegistry.set(downstreamItem.name, decision)
			} else {
				const downstreamTask = createTask(taskTypes, downstreamItem as TaskRecord)
				downstreamTask.dependsOn(task)
			}
		})
	}
	taskRegistry.set(taskRecord.name, task)
	return task
}

function isDecisionRecord(record: TaskRecord | DecisionRecord): record is DecisionRecord {
	return record.type === 'Decision'
}
