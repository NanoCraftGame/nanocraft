<script lang="ts">
	import { Task, type Status, type VisibleAreaCoordsDate } from '$lib/model/tasks'
	import type { Character } from '$lib/model/character'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import DropDown from '$lib/components/DropDown.svelte'
	import DropDownItem from '$lib/components/DropDownItem.svelte'
	import { store } from '$lib/model/store'
	export let task: Task
	export let assignees: Character[]
	export let visibleAreaCoords: VisibleAreaCoordsDate

	let statuses: Record<Status, string> = {
		todo: '#C0C0C0',
		done: '		#32cd32',
		inProgress: '	#ffd139',
	}

	let assignee = assignees.find((a) => a.id === task.assignee)
	$: {
		assignee = assignees.find((a) => a.id === task.assignee)
	}
	function assign(e: CustomEvent<string>) {
		const assignee = assignees.find((a) => a.id === e.detail)
		if (assignee) store.pmSim.assign(assignee, task)
	}

	function getProcess(status: Status) {
		switch (status) {
			case 'todo':
				return '#fff'
			case 'done':
				return '#AAF1AA'
			case 'inProgress':
				return '#C0C0C0'
		}
	}
	let moreIsOpen = false
	function toggleOpen() {
		moreIsOpen = !moreIsOpen
	}
</script>

<div class="tasks__row task" style="background: {getProcess(task.status)}">
	<div class="task__piston" style="width:  {10 * task.waitTime}px" />
	<div class="task__chart">
		<div class="hidden">
			<div class="hidden__name">{task.name}</div>
			<div class="hidden__ratio">
				{task.timeSpent.toFixed(1)}/{task.estimate}
			</div>
		</div>
		<button class="task__detailts" on:click={toggleOpen}>
			<div class="task__detail task__detail_name">{task.name}</div>
			<div class="task__detail task__detail_ratio">
				{task.timeSpent.toFixed(1)}/{task.estimate}
			</div>
		</button>
		{#if moreIsOpen}
			<div class="task__description">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque corporis consequatur est
				vero. Incidunt aut, ipsam rem nemo dolorem animi!
			</div>
			<!-- {task.description} -->
		{/if}
		<div class="task__bars">
			<div class="task__bar task__bar_primary" style="width: {10 * task.estimate}px;" />
			<div
				class="task__bar task__bar_secondary"
				style="width: {10 * task.timeSpent}px; background: {statuses[task.status]};"
			/>
		</div>
	</div>
	<div class="task__assignee assignee">
		{#if assignee}
			<div class="assignee__avatar">
				<WaitingImage src={assignee.image} alt={assignee.name} width={40} height={40} />
			</div>
			<div class="assignee__name">
				{assignee.name}
			</div>
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
	button {
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		color: inherit;
		background: none;
		border: 0;
		outline: 0;
		text-align: left;
		cursor: pointer;
		color: inherit;
	}
	button::-moz-focus-inner {
		padding: 0;
		border: 0;
	}
	/* ============= */
	.task {
		display: flex;
		padding: 0.5rem 100px 0 0;
		border-bottom: 1px solid black;
	}
	.task:last-of-type {
		border-bottom: 0;
	}
	.task__chart {
		position: relative;
	}
	.task__bar_primary {
		background: rgb(170, 228, 251);
		height: 40px;
	}
	.task__bar_secondary {
		background: #ffed93;
		height: 20px;
		position: relative;
		top: -20px;
	}
	.task__detailts {
		display: block;
		position: absolute;
		top: 0;
		z-index: 2;
		padding: 0;
	}
	.task__detail {
		white-space: nowrap;
	}
	.task__description {
		max-width: 350px;
		background: #fff;
		padding: 0.5rem 1.4rem;
		border: 1px solid black;
	}
	.assignee {
		margin-left: 20px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.assignee__avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
	}
	.hidden {
		height: 0;
		opacity: 0;
	}
	.hidden__name,
	.hidden__ratio {
		white-space: nowrap;
	}
</style>
