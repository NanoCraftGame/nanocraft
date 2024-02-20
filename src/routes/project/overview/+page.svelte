<!-- 
    On this page we have a header (I put links on it later) an the table of tasks
    Each row in the able is a task. Task contains:
    - assignee
    - task name
    - task description (not visible in the table)
    - task status
    - task priority (displayed as a position in the table)
    - estimated time
    - time spent (the estimated time is a horizontal bar in on of table cell, and time spent is another bar inside of it)
-->

<script lang="ts">
	import { onMount } from 'svelte'
	import { store } from '$lib/model/store'
	import Button from '../../../lib/components/Button.svelte'
	const pictures = import.meta.glob('/static/illustrations/characters/*.webp')

	let idToImage: Record<string, string> = {}
	let idToName: Record<string, string> = {}
	const crew = [store.project.getPlayer(), store.project.getColleague()]

	interface Task {
		// id of crew member (can be 'eli-wallace' or 'ava-singh')
		assignee: string | null
		name: string
		description: string
		status: 'todo' | 'inProgress' | 'done' | 'canceled' | 'blocked'
		priority: number
		estimatedTime: number
		timeSpent: number
		wait: number
	}
	const tasks: Task[] = [
		{
			assignee: 'eli-wallace',
			name: 'Find the supplier of X',
			description: 'the X is a product that we need to produce the material Y',
			status: 'inProgress',
			priority: 1,
			estimatedTime: 10,
			timeSpent: 12,
			wait: 0,
		},
		{
			assignee: 'ava-singh',
			name: 'Find prospective buyers for Y',
			description: 'There are 300 potential buyers for Y, we need to find at least 3',
			status: 'inProgress',
			priority: 0,
			estimatedTime: 28,
			timeSpent: 10,
			wait: 0,
		},
		{
			assignee: 'eli-wallace',
			name: 'Find producer of the machine PP',
			description:
				'We need to find a producer of the machine PP, it is a key element of the production process',
			status: 'todo',
			priority: 2,
			estimatedTime: 10,
			timeSpent: 0,
			wait: 0,
		},
		{
			assignee: 'eli-wallace',
			name: 'Find producer of the machine ER',
			description:
				'We need to find a producer of the machine ER, it is a key element of the production process',
			status: 'todo',
			priority: 3,
			estimatedTime: 10,
			timeSpent: 0,
			wait: 0,
		},
		{
			assignee: null,
			name: 'Find a producer of the machine QQ',
			description:
				'We need to find a producer of the machine QQ, it is a key element of the production process',
			status: 'todo',
			priority: 4,
			estimatedTime: 10,
			timeSpent: 0,
			wait: 0,
		},
		{
			assignee: 'ava-singh',
			name: 'Test execution of the machine ER',
			description:
				'We need to find a producer of the machine ER, it is a key element of the production process',
			status: 'todo',
			priority: 5,
			estimatedTime: 12,
			timeSpent: 0,
			wait: 0,
		},
	]

	onMount(async () => {
		const resImg: typeof idToImage = {}
		const resNames: typeof idToImage = {}
		for (const character of crew) {
			resImg[character!.id] = ((await pictures[character!.image]()) as any).default
			resNames[character!.id] = character!.name
		}
		idToImage = resImg
		idToName = resNames
	})

	tasks.sort((a, b) => a.priority - b.priority)
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
	console.table(tasks)
</script>

<div class="header">
	<a href="/project/overview" class="current">Overview</a>
	<a href="/project/tasks">This will change</a>
	<a href="/project/crew">And this</a>
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
