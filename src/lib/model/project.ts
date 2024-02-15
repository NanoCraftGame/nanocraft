import type { Material, MaterialFactory } from './material'

export class Project {
	private materialFactory: MaterialFactory
	private material: Material | null = null

	constructor(materialFactory: MaterialFactory) {
		this.materialFactory = materialFactory
	}

	setMaterial(name: string) {
		this.material = this.materialFactory.create(name)
	}
}
