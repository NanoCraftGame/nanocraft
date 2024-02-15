import { MaterialFactory } from './material'
import { Project } from './project'

export const store = {
	project: new Project(new MaterialFactory()),
}
