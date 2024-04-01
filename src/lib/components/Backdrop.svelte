<script lang="ts">
	import { fade } from 'svelte/transition'
	export let isOpen: boolean = false

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

	$: {
		toggleScroll()
	}
</script>

{#if isOpen}
	<div class="backdrop" transition:fade>
		<slot toggler={toggleHandler} />
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;
		width: 100dvw;
		height: 100dvh;
		background-color: rgba(16, 37, 68, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	:global(.hidden-scroll) {
		overflow: hidden;
	}
</style>
