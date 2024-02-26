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

if (browser) {
	project.hydrate(JSON.parse(localStorage.getItem('project') || '{}'))
	tasks.hydrate(JSON.parse(localStorage.getItem('tasks') || '{"tasks":[]}'))
	timer.onTick(() => {
		console.log('tick')

		tasks.updateTasks()
		localStorage.setItem('project', JSON.stringify(project.serialize()))
		localStorage.setItem('tasks', JSON.stringify(tasks.serialize()))
	})
}

const sim = new Sim(timer, tasks)
export const store = {
	project,
	sim,
	tasks,
	timer,
}
