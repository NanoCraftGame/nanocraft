<script lang="ts">
	import { createEventDispatcher, onMount, setContext, onDestroy } from 'svelte'
	import Button from './Button.svelte'
	import { writable } from 'svelte/store'
	import { browser } from '$app/environment'
	export let value = ''
	export let label = ''

	let isOpen = false

	const selected = writable(value)
	const dispatch = createEventDispatcher()

	setContext('radioGroup', {
		onSelect,
		selected,
	})

	onMount(() => {
		if (browser) {
			document.addEventListener('click', close)
		}
	})
	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', close)
		}
	})

	function onSelect(value: string) {
		selected.set(value)
		isOpen = false
		dispatch('change', value)
	}

	function open(e?: Event) {
		if (e) e.stopPropagation()
		isOpen = true
	}
	function close(e?: Event) {
		if (e) e.stopPropagation()
		isOpen = false
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
