import { materials } from './statics/materials'
export interface Material {
	name: string
	type: string
}

export class MaterialFactory {
	create(id: string): Material {
		const material = materials.find((m) => m.id === id)
		if (!material) {
			throw new Error(`Material not found: ${id}`)
		}
		return material
	}
}