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
	const name = context.name

	function handleChange(event: Event) {
		const value = (event.target as HTMLInputElement).value
		const checked = (event.target as HTMLInputElement).checked
		if ('onSelect' in context) {
			if (checked) {
				context.onSelect(value)
			}
		}
	}
</script>

<li class="radio-select" class:selected={value === selected}>
	<input
		type="radio"
		id={value}
		{name}
		{value}
		on:change={handleChange}
		checked={value === selected}
	/>
	<label for={value}>
		<slot />
	</label>
</li>

<style>
	.radio-select {
		border: 2px solid #00f;
		border-radius: 10px;
		background-color: rgba(0, 0, 255, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}
	.radio-select * {
		cursor: pointer;
	}
	.radio-select:hover {
		background-color: rgba(0, 0, 255, 0.7);
	}
	.radio-select label {
		padding: 20px;
		display: flex;
	}
	.radio-select input {
		display: none;
	}
	.radio-select.selected {
		border: 2px solid rgb(101, 240, 255);
	}
</style>
