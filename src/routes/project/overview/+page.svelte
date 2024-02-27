<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { store } from '$lib/model/store'
	import Button from '$lib/components/Button.svelte'
	import { Task } from '$lib/model/tasks'
	import TaskRow from './TaskRow.svelte'

	// TODO
	// - cant reassign task tha are done or in progress
	// - add checkmark to done tasks
	// - cant start task in the past
	// - drag'n'drop tasks to change priority
	// - layout for long progress bars

	const crew = [store.project.getPlayer(), store.project.getColleague()]

	store.timer.setTempo(50)

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

<div class="header">
	<a href="/project/overview" class="current">Project Overview</a>
	<a href="/inventory">Inventory</a>
	<a href="/reports">Reports</a>
</div>
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
		min-height: 100vh;
		background-color: rgb(234, 240, 255);
		padding: 1rem;
	}
	.header {
		display: flex;
		padding: 1rem;
		background: rgb(10, 58, 180);
		color: white;
		border-bottom: 2px solid rgb(35, 222, 255);
	}
	.header a {
		color: white;
		text-decoration: none;
		margin-right: 1rem;
	}
	.header a:hover {
		text-decoration: underline;
	}
	.header .current {
		text-decoration: underline;
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
