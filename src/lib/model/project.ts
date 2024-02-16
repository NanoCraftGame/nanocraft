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

	setMaterial(name: string) {
		this.material = this.materialFactory.create(name)
	}

	setPlayer(id: string) {
		this.player = this.characterFactory.create(id)
	}

	setColleague(id: string) {
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
