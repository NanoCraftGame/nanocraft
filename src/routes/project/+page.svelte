<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { store } from '$lib/model/store'
	import TaskRow from './TaskRow.svelte'
	import Header from '$lib/components/Header.svelte'
	import { Decision, Task } from '$lib/model/tasks'
	import type { Character, CharacterData } from '$lib/model/character'
	import Button from '$lib/components/Button.svelte'
	import SvelteMarkdown from 'svelte-markdown'
	import Panel from '../../lib/components/Panel.svelte'
	import { fade } from 'svelte/transition'
	import WaitingImage from '$lib/components/WaitingImage.svelte'

	export let data

	// TODO
	// - layout for long progress bars

	const crew = [store.project.getPlayer(), store.project.getColleague()]

	let tasks: Task[] = []

	let decision: Decision | null = null

	onMount(async () => {
		if (!crew[0] || !crew[1]) {
			goto('/wizards/1/crew')
			return
		}
		store.setTasksGraph(data.taskTypes, data.tasks)
		tasks = store.pmSim.getTasks()
		store.subscribe(() => {
			tasks = store.pmSim.getTasks()
			const allTasksDone = tasks.every((t) => t.status === 'done' || t.isDormant)
			const allDecisionsDone = store.pmSim.getDecisions().every((d) => d.status === 'done')
			if (allTasksDone && allDecisionsDone) {
				store.timer.pause()
				alert('Hooray!!')
			}
		})
		store.pmSim.onDecisionUnlocked((d) => {
			store.timer.pause()
			decision = d
		})
	})

	function filterNonNull<T>(arr: (T | null)[]): T[] {
		return arr.filter((a) => a !== null) as T[]
	}

	let assignedPerson: Character | null = null
	$: {
		assignedPerson =
			crew.find((character) => {
				if (decision instanceof Decision) {
					const firstTask = decision?.dependencies[0]
					if (firstTask instanceof Task) {
						return character?.id === firstTask.assignee
					}
				}
				return false
			}) ?? null
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
	{#if decision}
		<div class="backdrop" transition:fade>
			<Panel>
				<SvelteMarkdown source={decision.report} />
				<div class="footer" slot="footer">
					{#each decision.options as option}
						<Button
							on:click={() => {
								decision?.decide(option)
								decision = null
							}}
						>
							{decision.options.length > 1 ? option.description : 'OK'}
						</Button>
					{/each}
				</div>
			</Panel>
			<div class="assigned">
				<div class="assigned__avatar">
					{#if assignedPerson}
						<WaitingImage
							src={assignedPerson.image}
							alt={assignedPerson.id}
							width={200}
							height={200}
						/>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.backdrop {
		min-height: calc(100vh - 65px);
		background-color: rgba(16, 37, 68, 0.7);
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center; /* Add this line */
	}
	.footer {
		display: flex;
		gap: 24px;
	}
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
	.assigned {
		width: 90%;
		display: flex;
		justify-content: flex-end;
	}
	.assigned__avatar {
		border-radius: 50%;
		overflow: hidden;
		border: 2px solid rgb(35, 222, 255);
	}
</style>
