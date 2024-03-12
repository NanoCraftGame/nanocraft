import { CharacterFactory } from './character'
import { MaterialFactory } from './material'
import { Project } from './project'
import { Sim } from './sim'
import { Timer } from './timer'
import { PmSim } from './tasks'
import { browser } from '$app/environment'
import { graphs, taskTypes } from './statics/example-tasks'

const project = new Project(new MaterialFactory(), new CharacterFactory())
const pmSim = new PmSim()
pmSim.registerGraph(graphs)
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
	pmSim.hydrate(JSON.parse(localStorage.getItem('tasks') || '{"tasks":[], "decisions": []}'))
	settings = JSON.parse(localStorage.getItem('settings') || '{"tempo":10}')
	timer.setTempo(settings.tempo)
	timer.pause()
	timer.setTick(JSON.parse(localStorage.getItem('tick') || '0'))
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

const sim = new Sim(timer, pmSim)
export const store = {
	settings,
	project,
	sim,
	pmSim,
	timer,
	reset() {
		project.setMaterial(null)
		project.setPlayer(null)
		project.setColleague(null)
		timer.setTick(0)
		pmSim.clear()
		pmSim.registerGraph(graphs)
		save(0)
	},
}
