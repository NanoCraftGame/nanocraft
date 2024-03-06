import { AttentionSpan, Task, Decision } from '../tasks'

class ProcurementResearch extends Task {
	requiredAttention = AttentionSpan.FullAttention
}

class Procurement extends Task {
	requiredAttention = AttentionSpan.PartialAttention
}

const findPumpsSupplier = new ProcurementResearch('Find pumps suplier', 5)

const orderPumpsIveco = new Procurement('Order 3 Iveco high-pressure pumps', 10)

const orderPumpsVolvo = new Procurement('Order 2 Volvo high-pressure pumps', 12)

const pumpsSupliersReport = `
# Pumps suppliers report
## Market state
The market is currently in a state of oversupply, with a lot of suppliers offering
high-pressure pumps. This is a good time to buy, as prices are low and delivery 
times are short. However pumps are hard to transport, so we need to choose a 
supplier that can deliver them to the construction site. This leaves us with 
two options:

1. Iveco,
2. Volvo.

## Iveco
Iveco is a well-known brand, and their pumps are cheaper and faster to deliver.
However, they are not as reliable as Volvo pumps.

## Volvo
Volvo pumps are more reliable, but they are more expensive and take longer to deliver.
`

const choosePumpsSupplier = new Decision(pumpsSupliersReport, [
	{
		task: orderPumpsIveco,
		description: 'Iveco is cheaper and faster',
	},
	{
		task: orderPumpsVolvo,
		description: 'Volvo is more reliable',
	},
])

choosePumpsSupplier.dependsOn(findPumpsSupplier)

orderPumpsIveco.dependsOn(choosePumpsSupplier)
orderPumpsVolvo.dependsOn(choosePumpsSupplier)


const findBiphasicReactorSupplier = new ProcurementResearch('Find Biphase reactor suplier', 15)
// we found only one biphase reactor supplier, so no need for decison here..
const orderBiphaseReactor = new Procurement('Order 3 Iveco high-pressure pumps', 10)
orderBiphaseReactor.dependsOn(findBiphasicReactorSupplier)


export const graphs = [choosePumpsSupplier, findBiphasicReactorSupplier]
