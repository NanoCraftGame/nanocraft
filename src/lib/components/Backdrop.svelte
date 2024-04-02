<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	export const isOpen: boolean = false
	export const closable: boolean = false

	onMount(() => {
		document.body.classList.add('hidden-scroll')
	})
	onDestroy(() => {
		document.body.classList.remove('hidden-scroll')
	})
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="backdrop" transition:fade>
	<slot />
</div>

<style>
	.backdrop {
		position: fixed;
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
