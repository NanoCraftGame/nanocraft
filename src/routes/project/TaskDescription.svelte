<script lang="ts">
	import { Task } from '$lib/model/tasks'
	import Backdrop from '$lib/components/Backdrop.svelte'
	import Panel from '$lib/components/Panel.svelte'
	import { escape } from '$lib/directives/escape'
	import { Character } from '$lib/model/character'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	export let isOpen: boolean = false
	export let task: Task | null
	export let close: VoidFunction
	export let assignee: Character | undefined

	const statusMap = {
		todo: 'To Do',
		inProgress: 'In Progress',
		done: 'Done',
	}
</script>

<Backdrop {isOpen}>
	<Panel>
		<div class="container" use:escape on:escape={close}>
			<h3>{task?.name}</h3>
			<div class="description">{task?.description}</div>
			<div class="resume">
				<div class="resume__statuses">
					<p class="resume__status">
						<span class="resume__title">Status:</span>
						<span class="resume__value">{task && statusMap[task?.status]}</span>
					</p>
					<p class="resume__status">
						<span class="resume__title">Estimated time:</span>
						<span class="resume__value">{task?.estimate}</span>
					</p>
					{#if task?.status === 'done'}
						<p class="resume__status">
							<span class="resume__title">Spent time:</span>
							<span class="resume__value">{task.timeSpent.toFixed(2)}</span>
						</p>
					{/if}
				</div>
				<div class="resume__status resume__status--separated">
					<span class="resume__title">Assigned to:</span>
					{#if assignee}
						<div class="resume__assignee">
							<div class="resume__avatar">
								<WaitingImage src={assignee.image} alt={assignee.id} width={75} height={75} />
							</div>
							<div class="assignee__name">{assignee?.name}</div>
						</div>
					{/if}
					{#if task?.status === 'todo'}
						<slot />
					{/if}
				</div>
			</div>
		</div>
	</Panel>
</Backdrop>

<style>
	.container {
		min-width: 50dvw;
		margin: 0 auto;
	}
	.description {
		margin-bottom: 2rem;
	}
	.resume__status {
		margin: 0.5rem;
	}
	.resume__status--separated {
		margin-top: 2rem;
	}
	.resume__title {
		font-weight: bold;
	}
	.resume__assignee {
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.resume__avatar {
		width: 75px;
		height: 75px;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}
	.assignee__name {
		font-weight: bold;
	}
	@media (max-width: 600px) {
		.container {
			margin: 0;
		}
	}
</style>
