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
	let dropdownDiv: HTMLDivElement
	let container: HTMLDivElement

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
		setTimeout(() => {
			const dropdownRect = dropdownDiv.getBoundingClientRect()
			const containerRect = container.getBoundingClientRect()
			if (dropdownRect.bottom > window.innerHeight) {
				dropdownDiv.style.top = `${-dropdownRect.height - 3}px`
			} else {
				dropdownDiv.style.top = `${containerRect.height + 3}px`
			}
			dropdownDiv.style.opacity = '1'
		})
	}
	function close(e?: Event) {
		if (e) e.stopPropagation()
		isOpen = false
	}
</script>

<div class="container" bind:this={container}>
	<Button on:click={open} {...$$restProps}>
		{#if $$slots.label}
			<slot name="label" />
		{:else}
			{label}
		{/if}
		{#if isOpen}
			<div class="dropdown">
				<slot />
			</div>
		{/if}
	</Button>
	{#if isOpen}
		<div class="dropdown" bind:this={dropdownDiv}>
			<slot />
		</div>
	{/if}
</div>

<style>
	.container {
		position: relative;
	}
	.dropdown {
		position: absolute;
		z-index: 10;
		background-color: white;
		border: 1px solid #000;
		padding: 0.5rem;
		width: max-content;
		opacity: 0;
		transition: opacity 0.3s;
	}
</style>
