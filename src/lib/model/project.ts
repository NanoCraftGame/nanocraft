import type { Character, CharacterFactory } from './character'
import type { Material, MaterialFactory } from './material'

export class Project {
	private material: Material | null = null
	private player: Character | null = null
	private colleague: Character | null = null

	constructor(
		private materialFactory: MaterialFactory,
		private characterFactory: CharacterFactory,
	) {}

	setMaterial(id: string | null) {
		if (id === null) {
			this.player = null
			return
		}
		this.material = this.materialFactory.create(id)
	}

	setPlayer(id: string | null) {
		if (id === null) {
			this.player = null
			return
		}
		this.player = this.characterFactory.create(id)
	}

	setColleague(id: string | null) {
		if (id === null) {
			this.player = null
			return
		}
		this.colleague = this.characterFactory.create(id)
	}

	getMaterial() {
		return this.material
	}

	getPlayer() {
		return this.player
	}

	getColleague() {
		return this.colleague
	}
}
