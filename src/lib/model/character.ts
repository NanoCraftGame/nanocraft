import { characters } from './statics/characters'
import { writable, type Writable } from 'svelte/store'
const pictures = import.meta.glob('/static/illustrations/characters/*.webp')

export interface CharacterData {
	id: string
	name: string
	description: string
	image: string
}

export class Character {
	id: string
	name: string
	description: string
	image: Writable<string>
	private imagePath: string

	constructor(data: CharacterData) {
		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.imagePath = data.image
		this.image = writable('')
	}

	loadImage() {
		pictures[this.imagePath]().then((module) => {
			this.image.set((module as any).default)
		})
		return this
	}
}

export class CharacterFactory {
	create(id: string): Character {
		const character = characters.find((c) => c.id === id)
		if (!character) {
			throw new Error(`Character not found: ${id}`)
		}
		return new Character(character).loadImage()
	}
}

export function getAllCharacters() {
	return characters.map((c) => new Character(c).loadImage())
}
