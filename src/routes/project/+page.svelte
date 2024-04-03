<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { store } from '$lib/model/store'
	import { writable } from 'svelte/store'
	import TaskRow from './TaskRow.svelte'
	import Header from '$lib/components/Header.svelte'
	import type { Decision, Task } from '$lib/model/tasks'
	import Button from '$lib/components/Button.svelte'
	import SvelteMarkdown from 'svelte-markdown'
	import Panel from '../../lib/components/Panel.svelte'
	import { fade } from 'svelte/transition'

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

	let visibleAreaCoords = writable({
		left: 0,
		right: 0,
	})
	let tasksListNode: HTMLElement

	function getVisibleAreaCoords() {
		if (!tasksListNode) return
		let left = tasksListNode.scrollLeft
		let right = tasksListNode.clientWidth + left
		visibleAreaCoords.update(() => ({ left, right }))
	}
	onMount(() => getVisibleAreaCoords())
</script>

<Header current="project" />
<div class="background">
	<div class="tasks" on:scroll={getVisibleAreaCoords} bind:this={tasksListNode}>
		{#each tasks.slice(0) as task}
			<TaskRow {task} assignees={filterNonNull(crew)} visibleAreaCoords={$visibleAreaCoords} />
		{/each}
	</div>
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
		align-items: center;
		justify-content: center; /* Add this line */
	}
	.footer {
		display: flex;
		gap: 24px;
	}
	.background {
		min-height: calc(100dvh - 65px);
		background-color: rgb(234, 240, 255);
		padding: 1rem;
	}
	.tasks {
		border: 1px solid black;
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-rows: auto;
		overflow: auto;
		position: relative;
	}
</style>
