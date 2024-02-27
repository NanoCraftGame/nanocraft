export class Timer {
	private listeners: (() => void)[] = []
	private timer: ReturnType<typeof setInterval>
	private tempo: number = 100
	constructor() {
		this.timer = setInterval(this.tick, this.tempo)
	}
	onTick(listener: () => void) {
		this.listeners.push(listener)
	}

	/**
	 * @param tempo 1 is for 1 hour per second, 1000 is for 1 hour per 1/1000 of a second
	 */
	setTempo(tempo: number) {
		this.tempo = 1000 / tempo
		this.pause()
		this.resume()
	}
	getTempo() {
		return 1000 / this.tempo
	}

	pause() {
		clearInterval(this.timer)
	}
	resume() {
		this.timer = setInterval(this.tick, this.tempo)
	}

	private tick = () => {
		this.listeners.forEach((listener) => listener())
	}
}
