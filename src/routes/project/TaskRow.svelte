<script lang="ts">
	import { Task, type Status } from '$lib/model/tasks'
	import type { Character } from '$lib/model/character'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import DropDown from '$lib/components/DropDown.svelte'
	import DropDownItem from '$lib/components/DropDownItem.svelte'
	import { store } from '$lib/model/store'
	export let task: Task
	export let assignees: Character[]

	let statuses: Record<Status, string> = {
		todo: '#E8ECEF',
		done: '#B1F1BC',
		inProgress: '#A2D9FF',
	}

	let assignee = assignees.find((a) => a.id === task.assignee)
	$: {
		assignee = assignees.find((a) => a.id === task.assignee)
	}
	function assign(e: CustomEvent<string>) {
		const assignee = assignees.find((a) => a.id === e.detail)
		if (assignee) store.pmSim.assign(assignee, task)
	}
</script>

<div class="task task--{task.status}" style="opacity: {task.isDormant ? 0.3 : 1};">
	<div class="task__expander" style="width:  {10 * task.waitTime}px" />
	<div class="task__chart">
		<div class="hidden">
			<div class="hidden__name">{task.name}</div>
			<div class="hidden__ratio">
				{task.timeSpent.toFixed(1)}/{task.estimate}
			</div>
		</div>
		<div class="task__details">
			<div class="task__detail task__detail_name">{task.name}</div>
			<div class="task__detail task__detail_ratio">
				{task.timeSpent.toFixed(1)}/{task.estimate}
			</div>
		</div>
		<div class="task__bars">
			<div
				class="task__bar task__bar--estimate"
				style="width: {10 * task.estimate}px; background: {statuses[task.status]};"
			/>
			<div class="task__bar task__bar--spent" style="width: {10 * task.timeSpent}px;" />
		</div>
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
		padding: 0.5rem 100px 0 0;
		border-bottom: 1px solid black;
	}
	.task:last-of-type {
		border-bottom: 0;
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
	.task__chart {
		position: relative;
	}
	.task__bar--estimate {
		height: 40px;
	}
	.task__bar--spent {
		background: #feec99;
		height: 20px;
		position: relative;
		top: -20px;
	}
	.task__details {
		display: block;
		position: absolute;
		top: 0;
		z-index: 2;
		padding: 0;
	}
	.task__detail {
		white-space: nowrap;
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
	.hidden {
		height: 0;
		opacity: 0;
	}
	.hidden__name,
	.hidden__ratio {
		white-space: nowrap;
	}
</style>
