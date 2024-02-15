export interface Material {
	name: string
	type: string
}

export class FlexiMax implements Material {
	name = 'FlexiMax-Ti3C2'
	type = 'MXene'
}

export class ElectroIonGel implements Material {
	name = 'Electro-Ion Gel'
	type = 'Ionic Liquid'
}

export class MaterialFactory {
	create(name: string): Material {
		switch (name) {
			case 'mxene':
				return new FlexiMax()
			case 'ionic-liquid':
				return new ElectroIonGel()
			default:
				throw new Error(`Unknown material, ${name}. Known materials are: mxene, ionic-liquid.`)
		}
	}
}
