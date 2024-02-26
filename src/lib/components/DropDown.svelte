<script lang="ts">
	import { createEventDispatcher, onMount, setContext } from 'svelte'
	import Button from './Button.svelte'
	import { writable } from 'svelte/store'
	export let value = ''
	export let label = ''

	let isOpen = false
	function open(e: Event) {
		e.stopPropagation()
		isOpen = true
	}
	const selected = writable(value)
	const dispatch = createEventDispatcher()

	setContext('radioGroup', {
		onSelect,
		selected,
	})

	onMount(() => {
		document.addEventListener('click', (event) => {
			isOpen = false
		})
	})

	function onSelect(value: string) {
		selected.set(value)
		isOpen = false
		dispatch('change', value)
	}
</script>

<div>
	<Button on:click={open} {...$$restProps}>
		{#if $$slots.label}
			<slot name="label" />
		{:else}
			{label}
		{/if}
	</Button>
	{#if isOpen}
		<div class="dropdown">
			<slot />
		</div>
	{/if}
</div>

<style>
	.dropdown {
		position: absolute;
		z-index: 1;
		background-color: white;
		border: 1px solid #000;
		padding: 0.5rem;
		top: 2.5em;
		width: max-content;
	}
</style>
