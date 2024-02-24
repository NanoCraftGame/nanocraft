import { CharacterFactory } from './character'
import { MaterialFactory } from './material'
import { Project } from './project'
import { Sim } from './sim'
import { Timer } from './timer'
import { TasksStore } from './tasks'
import { browser } from '$app/environment'

const project = new Project(new MaterialFactory(), new CharacterFactory())
const tasksStore = new TasksStore()
const timer = new Timer()

if (browser) {
	project.hydrate(JSON.parse(localStorage.getItem('project') || '{}'))
	tasksStore.hydrate(JSON.parse(localStorage.getItem('tasks') || '{"tasks":[]}'))
	timer.onTick(() => {
		console.log('tick')

		tasksStore.updateTasks()
		localStorage.setItem('project', JSON.stringify(project.serialize()))
		localStorage.setItem('tasks', JSON.stringify(tasksStore.serialize()))
	})
}

const sim = new Sim(timer, tasksStore)
export const store = {
	project,
	sim,
	tasksStore,
	timer,
}
