<script lang="ts">
	import { createEventDispatcher, setContext } from 'svelte'
	import Button from './Button.svelte'
	import { writable } from 'svelte/store'
	import { createPopper } from '@popperjs/core'
	import { escape } from '$lib/directives/escape'
	export let value = ''
	export let label = ''

	let isOpen = false

	const selected = writable(value)
	const dispatch = createEventDispatcher()
	let dropdownDiv: HTMLDivElement
	let button: HTMLButtonElement

	setContext('radioGroup', {
		onSelect,
		selected,
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
			createPopper(button, dropdownDiv, {
				placement: 'bottom-start',
				modifiers: [
					{
						name: 'offset',
						options: {
							offset: [0, 3],
						},
					},
				],
			})
			dropdownDiv.style.opacity = '1'
		})
	}
	function close() {
		isOpen = false
	}
</script>

<div class="container">
	<Button on:click={open} {...$$restProps} bind:node={button}>
		{#if $$slots.label}
			<slot name="label" />
		{:else}
			{label}
		{/if}
	</Button>
	{#if isOpen}
		<div class="dropdown" bind:this={dropdownDiv} use:escape on:escape={close}>
			<slot />
		</div>
	{/if}
</div>

<style>
	.container {
		display: inline-block;
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
