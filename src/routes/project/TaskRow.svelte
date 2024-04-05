<script lang="ts">
	import { Task, type Status } from '$lib/model/tasks'
	import type { Character } from '$lib/model/character'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import DropDown from '$lib/components/DropDown.svelte'
	import DropDownItem from '$lib/components/DropDownItem.svelte'
	import { store } from '$lib/model/store'
	export let task: Task
	export let assignees: Character[]
	export let leftBorder: number
	export let rightBorder: number

	let assignee = assignees.find((a) => a.id === task.assignee)
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

	let chartNode: HTMLElement
	let isVisible: boolean = false
	let rightPosition: boolean = false

	$: {
		if (chartNode instanceof HTMLElement) {
			const taskLeftSide = chartNode.offsetLeft
			const taskRightSide = chartNode.offsetLeft + chartNode.offsetWidth
			isVisible = taskLeftSide >= leftBorder && taskRightSide <= rightBorder
			if (taskRightSide > rightBorder) {
				rightPosition = true
			} else {
				rightPosition = false
			}
		}
	}
</script>

<div class="task {taskStatusClasses[task.status]}" style="opacity: {task.isDormant ? 0.3 : 1};">
	<div class="task__chart" style="margin-left: {10 * task.waitTime}px" bind:this={chartNode}>
		<div class="task__detail-hidden">{task.name}</div>
		<div
			class="task__detail-name
			{isVisible ? '' : 'sticky-name'} 
			{rightPosition ? 'sticky-name_right' : ''}"
		>
			{task.name}
		</div>
		<div class="task__detail-ratio">
			{task.timeSpent.toFixed(1)}/{task.estimate}
		</div>
		<div class="task__bar-estimate" style="width: {10 * task.estimate}px" />
		<div class="task__bar-spent" style="width: {10 * task.timeSpent}px;" />
	</div>
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
			{/if}
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
	.task__detail-hidden {
		opacity: 0;
		height: 0;
		overflow: hidden;
		white-space: nowrap;
	}
	.task__detail-name {
		height: 0;
		top: var(--padding-bars);
		padding: 0 var(--padding-bars);
		line-height: var(--bar-height);
		overflow-y: visible;
		white-space: nowrap;
		position: relative;
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
	.task__bar-estimate {
		height: calc(var(--bar-height) * 2 + var(--padding-bars) * 4);
	}
	.task__bar-spent {
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
	.task--todo .task__bar-estimate {
		background-color: #e8ecef;
	}
	.task--done .task__bar-estimate {
		background-color: #b1f1bc;
	}
	.task--inProgress .task__bar-estimate {
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
	.sticky-name {
		position: absolute;
		top: auto;
		left: 0;
		padding: var(--padding-bars) 2rem 0;
		height: auto;
		max-width: 100%;
		display: inline-block;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sticky-name_right {
		left: auto;
		right: 0;
	}
</style>
