<script lang="ts">
	import { getContext } from 'svelte'
	export let value: string
	let selected = ''

	const context = getContext('radioGroup') as any

	if (!('selected' in context)) {
		throw new Error('RadioGroupItem must be used inside a RadioGroup component')
	}
	context.selected.subscribe((value: string) => {
		selected = value
	})

	function handleChange(e: Event) {
		e.stopPropagation()
		context.onSelect(value)
	}
</script>

<button class="button" on:click={handleChange}>
	<slot />
</button>

<style>
	.button {
		background-color: transparent;
		border: none;
		display: block;
	}
</style>
