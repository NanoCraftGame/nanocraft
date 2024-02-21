import { CharacterFactory } from './character'
import { MaterialFactory } from './material'
import { Project } from './project'
import { Sim } from './sim'
import { Timer } from './timer'
import { TasksStore } from './tasks'

const project = new Project(new MaterialFactory(), new CharacterFactory())
const tasksStore = new TasksStore()
const timer = new Timer()
timer.onTick(() => {
	tasksStore.updateTasks()
})
const sim = new Sim(timer, tasksStore)
export const store = {
	project,
	sim,
	tasksStore,
	timer,
}
