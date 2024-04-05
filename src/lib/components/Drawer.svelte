<script lang="ts">
	import { escape } from '$lib/directives/escape'
	import { createEventDispatcher } from 'svelte'
	import Backdrop from './Backdrop.svelte'
	import { slide } from 'svelte/transition'
	const duration = 200
	export let open = false
	const dispatch = createEventDispatcher()
	function close() {
		open = false
		dispatch('close')
	}
</script>

{#if open}
	<Backdrop isOpen={open}>
		<div
			class="drawer"
			use:escape
			on:escape={close}
			transition:slide={{ delay: duration, duration: duration, axis: 'x' }}
		>
			<slot />
		</div>
	</Backdrop>
{/if}

<style>
	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		width: 300px;
		height: 100%;
		background-color: white;
		z-index: 10000;
		overflow: auto;
		padding: 1em;
	}
</style>
