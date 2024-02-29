import type { TasksStore } from './tasks'
import type { Timer } from './timer'

export class Sim {
	constructor(
		private timer: Timer,
		private tasksStore: TasksStore,
	) {}

	start() {
		this.timer.onTick(this.tick)
	}

	private tick = (tick: number) => {
		this.tasksStore.updateTasks(tick)
	}
}
