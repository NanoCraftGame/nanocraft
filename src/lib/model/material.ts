import { writable, type Writable } from 'svelte/store'
import { materials } from './statics/materials'
const pictures = import.meta.glob(
	'/src/static/illustrations/materials/*',
	{
		query: {
			enhanced: true,
		}
	}
)
export interface MaterialData {
	id: string
	name: string
	type: string
	image: string
	desc: {
		useCases: string
		targetMarket: string
		challenges: string
	}
}

export class Material {
	id: string
	name: string
	type: string
	image: Writable<string>
	desc: MaterialData['desc']
	private imagePath: string

	constructor(data: MaterialData) {
		this.id = data.id
		this.name = data.name
		this.type = data.type
		this.imagePath = data.image
		this.desc = data.desc
		this.image = writable('')
	}

	loadImage() {
		pictures[this.imagePath]().then((module) => {
			this.image.set((module as any).default)
		})
		return this
	}
}

export class MaterialFactory {
	create(id: string): Material {
		const material = materials.find((m) => m.id === id)
		if (!material) {
			throw new Error(`Material not found: ${id}`)
		}
		return new Material(material).loadImage()
	}
}

export function getAllMaterials() {
	return materials.map((m) => new Material(m).loadImage())
}
