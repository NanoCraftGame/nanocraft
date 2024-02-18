import { materials } from './statics/materials'
export interface Material {
	id: string
	name: string
	type: string
	image: string
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
