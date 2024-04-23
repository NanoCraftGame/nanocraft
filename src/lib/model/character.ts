import { characters } from './statics/characters'
import { writable, type Writable } from 'svelte/store'
import unnamed from '/src/static/illustrations/characters/unnamed.webp'
import type { Task } from './tasks'
const pictures = import.meta.glob(
	'/src/static/illustrations/characters/*.webp',
	{
		query: {
			enhanced: true,
		}
	})

export interface CharacterData {
	id: string
	name: string
	description: string
	image: string
}

export abstract class Character {
	id: string
	name: string
	description: string
	image: Writable<string>
	private imagePath: string

	abstract canTake(task: Task): boolean

	constructor(data: CharacterData) {
		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.imagePath = data.image
		this.image = writable('')
	}

	loadImage() {
		const meta = pictures[this.imagePath]
		if (meta) {
			meta().then((module) => {
				this.image.set((module as any).default)
			})
		} else {
			this.image.set(unnamed)
		}
		return this
	}
}

export class Founder extends Character {
	canTake(task: Task) {
		// founders can take any task
		return true // TODO except construction...
	}
}

export class CharacterFactory {
	create(id: string): Character {
		const character = characters.find((c) => c.id === id)
		if (!character) {
			throw new Error(`Character not found: ${id}`)
		}
		return new Founder(character).loadImage()
	}
}

export function getAllFounders() {
	return characters.map((c) => new Founder(c).loadImage())
}
