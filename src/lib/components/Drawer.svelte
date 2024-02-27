<script lang="ts">
	import { escape } from '$lib/directives/escape'
	import { createEventDispatcher } from 'svelte'
	import { fade, slide } from 'svelte/transition'
	const duration = 200
	export let open = false
	const dispatch = createEventDispatcher()
	function close() {
		open = false
		dispatch('close')
	}
</script>

{#if open}
	<div
		class="backdrop"
		in:fade={{ duration: duration }}
		out:fade={{ duration: duration }}
		aria-modal="true"
	></div>
	<div
		class="drawer"
		use:escape
		on:escape={close}
		transition:slide={{ delay: duration, duration: duration, axis: 'x' }}
	>
		<slot />
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9999;
	}

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
