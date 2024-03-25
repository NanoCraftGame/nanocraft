<script lang="ts">
	import { setContext, createEventDispatcher } from 'svelte'
	import { writable } from 'svelte/store'

	export let name: string
	export let columns: 1 | 2 = 1
	export let defaultValue = ''

	const selected = writable(defaultValue)
	const dispatch = createEventDispatcher()

	setContext('radioGroup', {
		onSelect,
		name,
		selected,
	})

	function onSelect(value: string) {
		selected.set(value)
		dispatch('change', value)
	}
</script>

<ul class="list" class:two-col={columns === 2}>
	<slot />
</ul>

<style>
	.list {
		display: grid;
		gap: 20px;
		list-style: none;
		padding: 0;
	}
	.list.two-col {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (max-width: 840px) {
		.list {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
	}
</style>
