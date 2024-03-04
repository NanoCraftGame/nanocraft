# Tasks & Decisions specifications

## Tasks

Tasks are pieces of work that can be done by the game characters. Tasks span some amount of time
which is updated by the simulation. Initially a task is characterized by:

- Name
- Estimate
- Description (optional)

There are several task types, each of which is characterized by its _type_ and _needed attention_.

Tasks are added into and managed by _project management simulation_ (_PM sim_).

### Times

A task has _estimate_, _time spent_ on it and the _real time_ that the task requires to be done.

The _real time_ is calculated upon task creation as log-normally distributed value which is provided
by library function `calculateRealTime(estimate: number): number`.

The _time spent_ increases on certain amount at each call of task's `tick` method which is called by
the _PM sim_ on each simulation tick. The increment calculated as `n` \* `scale`, where `scale` is a
global constant and `n` is the argument provided by _PM sim_ depending on attention span (see
below).

A task also has _wait time_, which depend on the environment and is set by _PM sim_. More on it
later.

### Tasks assignment

A tasks can have an _assignee_ which it is assigned to.

The assignment is done by calling the `assign` method with the `id` of a character. It's Character
class which is responsible for checking whether a task of a particular type can be assigned to this
character.

Only tasks in `todo` status can be assigned (see below).

### Task statuses and transitions

In any point of time a task is in one of the following statuses:

- `todo`,
- `inProgress`,
- `done`;

The transition between states is always `todo` -> `inProgress` -> `done`. Initially all tasks
created in `todo` state.

The _PM sim_ maintains a _task queue_, which is a collection of all tasks, assigned to the same
assignee. The tasks in the queue are in the same order as in topologically ordered list of all tasks
(see below).

The _PM sim_ is responsible for transition a task from `todo` to `inProgress` state. On each
simulation tick it checks following conditions:

- For each assignee at any time there must be at least one task in `inProgress` state, unless:
  - all tasks assigned to them are in `done` state, or
  - all tasks assigned to them have unresolved dependencies, i.e. a task can be transitioned to
    `inProgress` only when it has all its dependencies resolved (see below);
- The next task to transition to `inProgress` is the first `todo` task in the queue.
- For each assignee at any given time only one _full attention_ task can be `inProgress`;
- For each assignee at any given time no more than three _partial attention_ tasks can be
  `inProgress` if that assignee has also a _full attention_ task assigned;
- No more than five _partial attention_ tasks for an assignee can be `inProgress` simultaneously;

On each simulation tick the _PM sim_ also calls `tick` on method for all tasks that are
`inProgress`; as mentioned above, this method increases task's _time spent_ and also it checks if
_time spent_ exceeded _real time_ and if that is the case, it transitions the task to `done` state.
The argument for the `tick` method depends on the attention span: it is 0.1 for _partial attention_
tasks and for the full-attention task it equal to 1 decreased on 0.1 for each partial attention
task that is `inProgress` and assigned to the same assignee.

### Dependencies

A task can depend on another task or on a _decision_.

Decisions and tasks follow the same interface, _dependable_ which has two methods:

- `dependOn(dependable: Dependable): void` and
- `reportDependencies(): string[]` which return a list of dependencies IDs.
- `reportDependents(): string[]` which return a list of dependent _dependable_ IDs.

When tasks and decisions are registered in the _PM sim_ it checks if all dependencies for each
dependable have been registered, it throws an error if it doesn't find a dependency with proper id
in its storage. It also throw an error if there's a cycle in dependencies.

It holds a topologically ordered list of all tasks and decisions (i.e. a dependency in that list
must always have lower index than a dependant).

### Wait time calculation

Let's call _task duration_ a number that is for any given task:

- Task estimate, when task is in `todo` state,
- A maximum of estimate and time spent, when task is `inProgress`,
- Time spent when task is in `done` state.

Then to get a current task's _wait time_ calculate a sum of wait time and the duration of all its
dependencies and the of the previous task in its assignee queue and choose the bigger. For the first
task in the queue with no dependencies wait time is set to 0.

However, if task is assigned or re-assigned, its wait time is set to current tick times `scale`
constant.

## Dormant tasks and decisions

Tasks that depend on a decision are _dormant_. When decision is unlocked, which, in turn, happens
when all it's dependencies are in `done` status, it _awakes_ one of the tasks that depend on it.
This sets the _dormant_ field of that task to false and that task also awakes it's dependencies.

## API and examples

```ts

interface Dependable {
  dependOn(dependable: Dependable): void
  reportDependencies(): string[]
  reportDependents(): string[]
}

enum AttentionSpan {
  FullAttention: 1,
  PartialAttention: 0.1
}

abstract class Task implements Dependable {
  id: string
  attentionSpan: AttentionSpan // to be overrode
  isDormant: boolean
  status: 'todo' | 'inProgress` | 'done'
  assign(assigneeId: string): void
  tick:(attention: number): void
  awake(): void
  dependOn(dependency: Dependable): void
  // + Dependable implementation
}

class ProcurementResearch extends Task {
  attentionSpan: AttentionSpan.FullAttention
}
class Procurement extends Task {
  attentionSpan: AttentionSpan.PartialAttention
}

const orderGasPump = new Procurement('Order gas pump', 3, 'The pump is needed because...')
const orderLiquidPump = new Procurement('Order Liquid pump', 3, 'The pump is needed because...')

class PmSim {
  registerGraph(Dependable[]): void
  tick(currentTick: number): void
}

interface DecisionOption: {
  description: string,
  task: Task
}

class Decision implements Dependable {
  constructor(public report: string, public options: DecisionOption[])
  status: 'todo' | 'done'
  tick(): void // checks if all dependencies are in `done` state, then it "unlocks"
  onUnlock(callback: (decision: Decision) => void)
  decide(option: DecisionOption): void
  // + Dependable implementation
}

// when decision was made to order the gas pump, that task is awaken and can be assigned
// by the player
if (character.canTake(orderGasPump)) {
	orderGasPump.assign(character.id)
}
```
