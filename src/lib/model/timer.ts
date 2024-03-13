type Listener = (tick: number) => void
export class Timer {
	private listeners: Listener[] = []
	private timer: ReturnType<typeof setInterval>
	private tempo: number = 100
	private tickCount: number = 0
	private isRunning = false
	onTick(listener: Listener) {
		this.listeners.push(listener)
	}

	/**
	 * @param tempo 1 is for 1 hour per second, 1000 is for 1 hour per 1/1000 of a second
	 */
	setTempo(tempo: number) {
		this.tempo = 1000 / tempo
		this.pause()
		if (this.isRunning) {
			this.resume()
		}
	}

	setTick(tick: number) {
		this.tickCount = tick
	}
	getTempo() {
		return 1000 / this.tempo
	}

	pause() {
		this.isRunning = false
		clearInterval(this.timer)
	}
	resume() {
		this.isRunning = true
		this.timer = setInterval(this.tick, this.tempo)
	}

	private tick = () => {
		this.tickCount++
		this.listeners.forEach((listener) => listener(this.tickCount))
	}
}
