import { CharacterFactory } from './character'
import { MaterialFactory } from './material'
import { Project } from './project'
import { Timer } from './timer'
import { PmSim } from './tasks'
import { browser } from '$app/environment'
import { initTasks, taskTypes } from './statics/example-tasks'

const project = new Project(new MaterialFactory(), new CharacterFactory())
const pmSim = new PmSim()
const timer = new Timer()
let settings = {
	tempo: 10,
}

function taskFactory(type: string) {
	const Task = taskTypes.find((t) => t.name === type)
	if (!Task) {
		throw new Error(`Task type not found: ${type}`)
	}
	return new Task('', 0)
}

if (browser) {
	project.hydrate(JSON.parse(localStorage.getItem('project') || '{}'))
	pmSim.setTaskFactory(taskFactory)
	if (pmSim.getTasks().length === 0) {
		const stored = localStorage.getItem('tasks')
		if (stored) {
			pmSim.hydrate(JSON.parse(stored))
		} else {
			pmSim.registerGraph(initTasks())
			pmSim.tick(0)
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

const subcribers: Subscriber[] = []

function notify() {
	subcribers.forEach((subcriber) => subcriber(store))
}

export const store = {
	settings,
	project,
	pmSim,
	timer,
	save,
	subcribe(subcriber: Subscriber) {
		subcribers.push(subcriber)
	},
	reset(all: boolean = false) {
		if (all) {
			project.setMaterial(null)
			project.setPlayer(null)
			project.setColleague(null)
		}
		timer.setTick(0)
		pmSim.clear()
		pmSim.registerGraph(initTasks())
		pmSim.tick(0)
		save(0)
	},
}
