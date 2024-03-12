<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { store } from '$lib/model/store'
	import TaskRow from './TaskRow.svelte'
	import Header from '$lib/components/Header.svelte'

	// TODO
	// - layout for long progress bars

	const crew = [store.project.getPlayer(), store.project.getColleague()]

	let tasks = store.pmSim.getTasks()

	onMount(async () => {
		if (!crew[0] || !crew[1]) {
			goto('/wizards/1/crew')
			return
		}
		tasks = store.pmSim.getTasks()
		store.timer.onTick(() => {
			tasks = store.pmSim.getTasks()
		})
	})

	function filterNonNull<T>(arr: (T | null)[]): T[] {
		return arr.filter((a) => a !== null) as T[]
	}
</script>

<Header current="project" />
<div class="background">
	<table class="table">
		<thead>
			<tr>
				<th>Assignee</th>
				<th>Task</th>
				<th>Timeline</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#each tasks as task}
				{#if !task.isDormant}
					<TaskRow {task} assignees={filterNonNull(crew)} />
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.background {
		min-height: calc(100vh - 65px);
		background-color: rgb(234, 240, 255);
		padding: 1rem;
	}
	.table {
		/* width: 100%; */
		border-collapse: collapse;
	}
	.table th,
	.table th {
		font-weight: bold;
	}
</style>
