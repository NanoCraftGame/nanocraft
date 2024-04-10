<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { store } from '$lib/model/store'
	import TaskRow from './TaskRow.svelte'
	import Header from '$lib/components/Header.svelte'
	import { Decision, Task } from '$lib/model/tasks'
	import type { Character } from '$lib/model/character'
	import Button from '$lib/components/Button.svelte'
	import SvelteMarkdown from 'svelte-markdown'
	import Panel from '../../lib/components/Panel.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import Backdrop from '$lib/components/Backdrop.svelte'
	import TaskDescription from './TaskDescription.svelte'

	export let data

	// TODO
	// - layout for long progress bars

	const crew = [store.project.getPlayer(), store.project.getColleague()]

	let tasks: Task[] = []

	let decision: Decision | null = null

	let descriptionIsOpen: boolean = false
	let openedTask: Task | null = null

	function openTaskDescription(task: Task) {
		openedTask = task
		descriptionIsOpen = true
	}
	function closeTaskDescription() {
		descriptionIsOpen = false
	}

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
	<div class="tasks">
		{#each tasks as task}
			<TaskRow {task} assignees={filterNonNull(crew)} on:click={() => openTaskDescription(task)} />
		{/each}
	</div>
	{#if decision}
		<Backdrop isOpen={Boolean(decision)}>
			<Panel scrollable={true} verticalAlign="top">
				<div class="profile">
					<div class="profile__avatar">
						{#if assignedPerson}
							<WaitingImage
								src={assignedPerson.image}
								alt={assignedPerson.id}
								width={100}
								height={100}
							/>
						{/if}
					</div>
					<div class="profile__name">
						{assignedPerson?.name}
					</div>
				</div>
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
		</Backdrop>
	{/if}
	{#if descriptionIsOpen}
		<TaskDescription isOpen={descriptionIsOpen} close={closeTaskDescription} task={openedTask} />
	{/if}
</div>

<style>
	.footer {
		display: flex;
		gap: 24px;
	}
	.background {
		height: calc(100dvh - 65px);
		overflow: hidden;
		background-color: rgb(234, 240, 255);
		padding: 1rem;
	}
	.tasks {
		height: 100%;
		border: 1px solid black;
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-rows: auto;
		overflow: auto;
	}
	.profile {
		display: none;
	}
	.profile__name {
		font-size: 1.2rem;
		font-weight: bold;
	}
	.assigned {
		width: 90%;
		display: flex;
		justify-content: flex-end;
	}
	.assigned__avatar,
	.profile__avatar {
		border-radius: 50%;
		overflow: hidden;
		border: 2px solid rgb(35, 222, 255);
		width: 200px;
		height: 200px;
	}
	.profile__avatar {
		width: 100px;
		height: 100px;
	}
	@media (max-width: 980px) {
		.profile {
			width: 100%;
			display: flex;
			align-items: center;
			gap: 2rem;
		}
		.assigned {
			display: none;
		}
	}
</style>
