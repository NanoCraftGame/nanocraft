import { CharacterFactory } from './character'
import { MaterialFactory } from './material'
import { Project } from './project'
import { Sim } from './sim'
import { Timer } from './timer'
import { TasksStore } from './tasks'
import { browser } from '$app/environment'

const project = new Project(new MaterialFactory(), new CharacterFactory())
const tasks = new TasksStore()
const timer = new Timer()
let settings = {
	tempo: 10,
}

if (browser) {
	project.hydrate(JSON.parse(localStorage.getItem('project') || '{}'))
	tasks.hydrate(JSON.parse(localStorage.getItem('tasks') || '{"tasks":[]}'))
	settings = JSON.parse(localStorage.getItem('settings') || '{"tempo":10}')
	timer.setTempo(settings.tempo)
	timer.setTick(JSON.parse(localStorage.getItem('tick') || '0'))
	timer.onTick((tick) => {
		tasks.updateTasks(tick)
		save(tick)
	})
}

function save(tick: number) {
	localStorage.setItem('project', JSON.stringify(project.serialize()))
	localStorage.setItem('tasks', JSON.stringify(tasks.serialize()))
	localStorage.setItem('settings', JSON.stringify(settings))
	localStorage.setItem('tick', JSON.stringify(tick))
}

const sim = new Sim(timer, tasks)
export const store = {
	settings,
	project,
	sim,
	tasks,
	timer,
	reset() {
		project.setMaterial(null)
		project.setPlayer(null)
		project.setColleague(null)
		timer.setTick(0)
		tasks.clear()
		save(0)
	},
}
