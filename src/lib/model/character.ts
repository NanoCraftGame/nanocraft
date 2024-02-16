import { characters } from './statics/characters'

export interface Character {
	id: string
	name: string
	description: string
	image: string
}

export class CharacterFactory {
	create(id: string): Character {
		const character = characters.find((c) => c.id === id)
		if (!character) {
			throw new Error(`Character not found: ${id}`)
		}
		return character
	}
}
