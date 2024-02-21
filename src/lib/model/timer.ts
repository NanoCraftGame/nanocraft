export class Timer {
	private listeners: (() => void)[] = []
	private timer: ReturnType<typeof setInterval>
	private tempo: number = 1000
	constructor() {
		this.timer = setInterval(this.tick, this.tempo)
	}
	onTick(listener: () => void) {
		this.listeners.push(listener)
	}

	setTempo(tempo: number) {
		this.tempo = tempo
		this.pause()
		this.resume()
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
