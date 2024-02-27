<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { store } from '$lib/model/store'
	import Button from '$lib/components/Button.svelte'
	import { Task } from '$lib/model/tasks'
	import TaskRow from './TaskRow.svelte'
	import Header from '$lib/components/Header.svelte'

	// TODO
	// - cant start task in the past
	// - drag'n'drop tasks to change priority
	// - layout for long progress bars

	const crew = [store.project.getPlayer(), store.project.getColleague()]

	let tasks = store.tasks.getTasks()

	onMount(async () => {
		if (!crew[0] || !crew[1]) {
			goto('/wizards/1/crew')
			return
		}
		if (store.tasks.getTasks().length === 0) {
			fakeTasks()
		}
		tasks = store.tasks.getTasks()
		store.timer.onTick(() => {
			tasks = store.tasks.getTasks()
		})
	})

	function fakeTasks() {
		store.tasks.addTask(new Task('Find the supplier of X', 1, 10))
		store.tasks.addTask(new Task('Find prospective buyers for Y', 0, 28))
		store.tasks.addTask(new Task('Find producer of the machine PP', 2, 10))
		store.tasks.addTask(new Task('Find producer of the machine ER', 3, 10))
		store.tasks.addTask(new Task('Find a producer of the machine QQ', 4, 10))
		store.tasks.addTask(new Task('Test execution of the machine ER', 5, 12))
		tasks = store.tasks.getTasks()
		tasks[0].assign(crew[0]!.id)
		tasks[1].assign(crew[1]!.id)
		tasks[2].assign(crew[1]!.id)
		tasks[3].assign(crew[1]!.id)
		tasks[5].assign(crew[0]!.id)
	}

	function reset() {
		store.tasks.clear()
		fakeTasks()
	}

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
				<TaskRow {task} assignees={filterNonNull(crew)} />
			{/each}
		</tbody>
	</table>
	<Button style="margin-top: 1em;" on:click={reset}>reset</Button>
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
