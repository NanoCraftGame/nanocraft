<script lang="ts">
	import { fade } from 'svelte/transition'
	export let isOpen: boolean = false
	export const closable: boolean | null = false

	function toggleScroll() {
		if (isOpen) {
			document.body.classList.add('hidden-scroll')
		} else {
			document.body.classList.remove('hidden-scroll')
		}
	}

	function toggleHandler() {
		isOpen = !isOpen
		toggleScroll()
	}
	function closeHandler() {
		if (closable && !isOpen) {
			isOpen = !isOpen
		}
	}

	$: {
		toggleScroll()
	}
</script>

{#if isOpen}
	<div class="backdrop" transition:fade on:click|self={closeHandler}>
		<slot toggler={toggleHandler} />
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;
		inset: 0;
		background-color: rgba(16, 37, 68, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	:global(.hidden-scroll) {
		overflow: hidden;
	}
</style>
