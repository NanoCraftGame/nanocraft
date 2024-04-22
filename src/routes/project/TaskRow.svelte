<script lang="ts">
	import { Task, type Status } from '$lib/model/tasks'
	import type { Character } from '$lib/model/character'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import DropDown from '$lib/components/DropDown.svelte'
	import DropDownItem from '$lib/components/DropDownItem.svelte'
	import TaskDescription from './TaskDescription.svelte'
	import { store, mode } from '$lib/model/store'
	export let task: Task
	export let assignees: Character[]
	export let leftBorder: number
	export let rightBorder: number

	let assignee: Character | undefined = assignees.find((a) => a.id === task.assignee)
	$: {
		assignee = assignees.find((a) => a.id === task.assignee)
	}
	function assign(e: CustomEvent<string>) {
		const assignee = assignees.find((a) => a.id === e.detail)
		if (assignee) store.pmSim.assign(assignee, task)
	}

	const taskStatusClasses: Record<Status, string> = {
		done: 'task--done',
		inProgress: 'task--inProgress',
		todo: 'task--todo',
	}

	let nameNode: HTMLElement
	let nameIsVisible: boolean = false
	let stickyNamePosition: 'left' | 'right' = 'left'

	$: {
		if (nameNode instanceof HTMLElement && nameNode.offsetParent instanceof HTMLElement) {
			const parent = getComputedStyle(nameNode?.offsetParent)
			const taskLeftSide = nameNode.offsetLeft - parseFloat(parent.paddingLeft)
			const taskRightSide =
				nameNode.offsetLeft + nameNode.offsetWidth - parseFloat(parent.paddingLeft)
			nameIsVisible = taskLeftSide >= leftBorder && taskRightSide <= rightBorder
			if (taskRightSide > rightBorder) {
				stickyNamePosition = 'right'
			} else {
				stickyNamePosition = 'left'
			}
		}
	}

	let descriptionIsOpen: boolean = false
	function openTaskDescription() {
		descriptionIsOpen = true
	}
	function closeTaskDescription() {
		descriptionIsOpen = false
	}
</script>

<div
	class="task {taskStatusClasses[task.status]}"
	class:task--dev-mode={$mode == 'developer' && task.isDormant}
	class:task--dormant={task.isDormant}
>
	<button
		class="task__chart"
		style="margin-left: {10 * task.waitTime}px"
		on:click={openTaskDescription}
	>
		<div class="task__detail-hidden" bind:this={nameNode}>{task.name}</div>
		<div
			class="task__detail-name"
			class:task__detail-name--sticky={!nameIsVisible}
			class:task__detail-name--sticky-right={stickyNamePosition === 'right'}
		>
			{task.name}
		</div>
		<div class="task__detail-ratio">
			{task.timeSpent.toFixed(1)}/{task.estimate}
		</div>
		<div class="task__estimate" style="width: {10 * task.estimate}px" />
		<div class="task__spent" style="width: {10 * task.timeSpent}px;" />
	</button>
	<div class="task__assignee assignee">
		{#if assignee}
			<div class="assignee__avatar">
				<WaitingImage src={assignee.image} alt={assignee.name} width={40} height={40} />
			</div>
			{#if task.status === 'todo'}
				<div class="assignee__reassign">
					<DropDown
						size="small"
						variant="secondary"
						on:change={assign}
						label="Reassign"
						disabled={task.isDormant}
					>
						{#each assignees.filter((a) => a.id !== task.assignee) as a}
							<DropDownItem value={a.id}>
								<WaitingImage src={a.image} alt={a.name} width={40} height={40} />
								{a.name}
							</DropDownItem>
						{/each}
					</DropDown>
				</div>
			{/if}task--dev-mode
		{:else if task.status === 'todo'}
			<DropDown
				size="small"
				variant="secondary"
				on:change={assign}
				label="Assign"
				disabled={task.isDormant}
			>
				{#each assignees as a}
					<DropDownItem value={a.id}>
						<WaitingImage src={a.image} alt={a.name} width={40} height={40} />
						{a.name}
					</DropDownItem>
				{/each}
			</DropDown>
		{/if}
	</div>
</div>
{#if descriptionIsOpen}
	<TaskDescription isOpen={descriptionIsOpen} close={closeTaskDescription} {task} {assignee}>
		<DropDown
			size="small"
			on:change={assign}
			label={assignee ? 'Reassign' : 'Assign'}
			disabled={task.isDormant}
		>
			{#each assignee ? assignees.filter((a) => a.id !== task.assignee) : assignees as a}
				<DropDownItem value={a.id}>
					<WaitingImage src={a.image} alt={a.name} width={40} height={40} />
					{a.name}
				</DropDownItem>
			{/each}
		</DropDown>
	</TaskDescription>
{/if}

<style>
	.task {
		display: flex;
		border-bottom: 1px solid #d0d0d0;
		--padding-bars: 0.4rem;
		--bar-height: 1.2rem;
	}
	.task:last-of-type {
		border-bottom: 0;
	}
	.task__chart {
		background: none;
		border: 0;
		padding: 0;
		font-size: inherit;
		font-family: inherit;
		font-weight: inherit;
		color: inherit;
		display: block;
		text-align: left;
		cursor: pointer;
	}
	.task__chart:focus {
		outline: 2px solid rgb(35, 222, 255);
	}

	.task__detail-name,
	.task__detail-hidden {
		height: 0;
		width: min-content;
		top: var(--padding-bars);
		padding: 0 var(--padding-bars);
		line-height: var(--bar-height);
		overflow-y: visible;
		white-space: nowrap;
		position: relative;
	}
	.task__detail-name--sticky {
		position: absolute;
		top: auto;
		left: 0;
		margin: var(--padding-bars) 1rem 0;
		height: auto;
		max-width: 90%;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.task__detail-name--sticky-right {
		left: auto;
		right: 0;
	}
	.task__detail-hidden {
		visibility: hidden;
	}
	.task__detail-ratio {
		height: 0;
		top: calc(var(--bar-height) + 3 * var(--padding-bars));
		padding: 0 var(--padding-bars);
		line-height: var(--bar-height);
		overflow-y: visible;
		position: relative;
		white-space: nowrap;
	}
	.task__estimate {
		height: calc(var(--bar-height) * 2 + var(--padding-bars) * 4);
	}
	.task__spent {
		height: calc(var(--bar-height) + var(--padding-bars) * 2);
		margin-top: calc(-1 * (var(--bar-height) + var(--padding-bars) * 2));
		background-color: #feec99;
	}

	.task--todo {
		background: #fff;
	}
	.task--done {
		background: #e5ffec;
	}
	.task--inProgress {
		background: #ecf0f3;
	}
	.task--dormant {
		opacity: 0.3;
	}
	.task--dev-mode {
		display: none;
	}
	.task--todo .task__estimate {
		background-color: #e8ecef;
	}
	.task--done .task__estimate {
		background-color: #b1f1bc;
	}
	.task--inProgress .task__estimate {
		background-color: #a2d9ff;
	}

	.assignee {
		margin-left: 20px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.assignee__avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
	}
</style>
