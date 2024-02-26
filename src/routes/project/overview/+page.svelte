<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { store } from '$lib/model/store'
	import Button from '$lib/components/Button.svelte'
	import { Task } from '$lib/model/tasks'
	const pictures = import.meta.glob('/static/illustrations/characters/*.webp')

	let idToImage: Record<string, string> = {}
	let idToName: Record<string, string> = {}
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
		const resImg: typeof idToImage = {}
		const resNames: typeof idToImage = {}
		for (const character of crew) {
			resImg[character!.id] = ((await pictures[character!.image]()) as any).default
			resNames[character!.id] = character!.name
		}
		idToImage = resImg
		idToName = resNames
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
			</tr>
		</thead>
		<tbody>
			{#each tasks as task}
				<tr>
					<td class="assignee">
						{#if task.assignee}
							<div class="userpic">
								<img src={idToImage[task.assignee]} alt={idToName[task.assignee]} />
							</div>
							{idToName[task.assignee]}
						{:else}
							<Button size="small">Assign</Button>{/if}
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
			{/each}
		</tbody>
	</table>
	<Button on:click={reset}>reset</Button>
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
	.table td {
		border: 1px solid #000;
		padding: 5px;
	}
	.table th {
		font-weight: bold;
	}

	.assignee {
		/* we'll see */
	}
	.userpic {
		width: 2em;
		height: 2em;
		overflow: hidden;
		border-radius: 50%;
		margin-right: 0.5em;
	}
	.userpic img {
		width: 100%;
		height: 100%;
	}
	.table .time {
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
	.table .estimate {
		padding: 0.3rem 0.3rem 1.9rem 0.3rem;
		background-color: #b5f6bf;
		overflow: visible;
	}
	.table .progress {
		padding: 0.3rem;
		background-color: #ffd139;
	}
</style>
