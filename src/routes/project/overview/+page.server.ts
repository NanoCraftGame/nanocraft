import fs from 'fs'
import { parse } from 'yaml'

export async function load() {
	const fileContents = fs.readFileSync('src/lib/model/statics/example-tasks.yml', 'utf8')
	const data = parse(fileContents, {})

	return data
}
