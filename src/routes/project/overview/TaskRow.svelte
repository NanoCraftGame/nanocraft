<script lang="ts">
	import { Task } from '$lib/model/tasks'
	import Button from '$lib/components/Button.svelte'
	import type { Character } from '$lib/model/character'
	import WaitingImage from '../../../lib/components/WaitingImage.svelte'
	export let task: Task
	export let assignees: Character[]
	let showAssign = false

	let assignee = assignees.find((a) => a.id === task.assignee)
	function assign() {
		showAssign = true
	}
</script>

<tr>
	<td class="assignee">
		{#if assignee}
			<div class="pic-row">
				<div class="userpic">
					<WaitingImage src={assignee.image} alt={assignee.name} width={40} height={40} />
				</div>
				<Button on:click={assign} size="small">Reassign</Button>
			</div>
			<div>
				{assignee.name}
			</div>
		{:else}
			<Button on:click={assign} size="small">Assign</Button>{/if}
	</td>
	<td>{task.name}</td>
	<td class="time">
		<div
			class="bar estimate"
			style="width: {10 * task.estimatedTime}px; margin-left: {10 * task.wait}px"
		>
			Est.: {task.estimatedTime}
		</div>
		<div
			class="bar progress"
			style="width: {10 * task.timeSpent}px; margin-left: {10 * task.wait}px"
		>
			Spent: {Math.floor(task.timeSpent)}
		</div>
	</td>
</tr>

<style>
	td {
		border: 1px solid #000;
		padding: 5px;
	}

	.assignee {
		/* we'll see */
	}
	.pic-row {
		display: flex;
		margin: 0.3rem 0;
	}
	.userpic {
		width: 2em;
		height: 2em;
		overflow: hidden;
		border-radius: 50%;
		margin-right: 0.5em;
	}
	.time {
		position: relative;
		height: 3.5rem;
		width: 900px;
	}
	.bar {
		position: absolute;
		bottom: 0;
		left: 0;
		white-space: nowrap;
	}
	.estimate {
		padding: 0.3rem 0.3rem 1.9rem 0.3rem;
		background-color: #b5f6bf;
		overflow: visible;
	}
	.progress {
		padding: 0.3rem;
		background-color: #ffd139;
	}
</style>
