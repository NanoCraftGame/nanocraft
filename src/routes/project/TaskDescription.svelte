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
	export let assignee: Character | null
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
						<span class="resume__value">{task?.status}</span>
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
				{#if assignee}
					<div class="resume__assignee">
						<div class="resume__avatar">
							<WaitingImage src={assignee.image} alt={assignee.id} width={150} height={150} />
						</div>
						<div class="assignee__name">{assignee?.name}</div>
					</div>
				{/if}
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
	.resume {
		display: flex;
	}
	.resume__statuses {
		flex: 1 1 auto;
	}
	.resume__status {
		margin: 0.5rem;
	}
	.resume__title {
		font-weight: bold;
	}
	.resume__value {
		text-transform: uppercase;
	}
	.resume__avatar {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}
	.assignee__name {
		text-align: center;
		font-size: 1.2rem;
		font-weight: bold;
	}
	@media (max-width: 840px) {
		.container {
			margin: 0;
		}
	}
	@media (max-width: 600px) {
		.resume {
			flex-direction: column;
		}
		.resume__avatar {
			margin-left: auto;
		}
		.assignee__name {
			margin-left: auto;
			width: 200px;
		}
	}
</style>
