<script lang="ts">
	import { Task } from '$lib/model/tasks'
	import Backdrop from '$lib/components/Backdrop.svelte'
	import Panel from '$lib/components/Panel.svelte'
	import { escape } from '$lib/directives/escape'
	export let isOpen: boolean = false
	export let task: Task | null
	export let close: VoidFunction
</script>

<Backdrop {isOpen}>
	<Panel>
		<div class="container" use:escape on:escape={close}>
			<h3 class="title">{task?.name}</h3>
			<div class="description">{task?.description}</div>
			<div class="additional-data">
				<p class="status">Status: {task?.status}</p>
				<p class="estimate">Estimated time: {task?.estimate}</p>
			</div>
		</div>
	</Panel>
</Backdrop>

<style>
	.container {
		width: max-content;
		max-width: 100%;
		margin: 0 auto;
	}
</style>
