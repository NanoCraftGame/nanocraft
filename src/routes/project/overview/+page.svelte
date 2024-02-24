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

	let tasks = store.tasksStore.getTasks()
	store.timer.onTick(() => {
		tasks = store.tasksStore.getTasks()
	})

	onMount(async () => {
		if (!crew[0] || !crew[1]) {
			goto('/wizards/1/crew')
			return
		}
		prepareTasks()
		const resImg: typeof idToImage = {}
		const resNames: typeof idToImage = {}
		for (const character of crew) {
			resImg[character!.id] = ((await pictures[character!.image]()) as any).default
			resNames[character!.id] = character!.name
		}
		idToImage = resImg
		idToName = resNames
	})

	function prepareTasks() {
		if (tasks.length) return
		store.tasksStore.addTask(new Task('Find the supplier of X', 1, 10))
		store.tasksStore.addTask(new Task('Find prospective buyers for Y', 0, 28))
		store.tasksStore.addTask(new Task('Find producer of the machine PP', 2, 10))
		store.tasksStore.addTask(new Task('Find producer of the machine ER', 3, 10))
		store.tasksStore.addTask(new Task('Find a producer of the machine QQ', 4, 10))
		store.tasksStore.addTask(new Task('Test execution of the machine ER', 5, 12))
		tasks = store.tasksStore.getTasks()
		tasks[0].assign(crew[0]!.id)
		tasks[1].assign(crew[1]!.id)
		tasks[2].assign(crew[1]!.id)
		tasks[3].assign(crew[1]!.id)
		tasks[5].assign(crew[0]!.id)

		// for each task calculate the wait time
		// it equals to the sum of the wait time and max(timeSpent, estimatedTime) of previous tasks with the same assignee
		// if the task is in progress, the wait time is 0
		const queues: Record<string, Task[]> = {}
		for (const task of tasks) {
			const assignee = task.assignee || 'null'
			if (!queues[assignee]) queues[assignee] = [task]
			else queues[assignee].push(task)
		}
		Object.values(queues).forEach((queue) => {
			queue.forEach((task, i) => {
				if (task.status === 'inProgress' || i === 0) {
					task.wait = 0
				} else {
					const prevTask = queue[i - 1]
					task.wait = prevTask.wait + Math.max(prevTask.timeSpent, prevTask.estimatedTime)
				}
			})
		})

		tasks = [...tasks]
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
				<th>Task name</th>
				<th>Time spent</th>
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
							Spent: {task.timeSpent}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
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
