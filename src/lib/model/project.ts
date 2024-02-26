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

	serialize() {
		return {
			material: this.material?.id || null,
			player: this.player?.id || null,
			colleague: this.colleague?.id || null,
		}
	}

	hydrate(data: any) {
		this.material = data.material ? this.materialFactory.create(data.material) : null
		this.player = data.player ? this.characterFactory.create(data.player) : null
		this.colleague = data.colleague ? this.characterFactory.create(data.colleague) : null
	}
}
