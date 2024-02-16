<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import Button from '$lib/components/Button.svelte'
	export let img = ''
	export let name = ''
	export let title = 'Crew member'
	export let dispatch = createEventDispatcher()

	function handleChange() {
		dispatch('rm')
	}
</script>

<div class="crew-card">
	<div class="desc">
		<WaitingImage src={img} alt={name} height={60} width={60} style="margin-right: 1rem;" />
		<h3>{title}: <br />{name}</h3>
	</div>
	<Button size="small" on:click={handleChange}>Change</Button>
</div>

<style>
	.crew-card {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		padding: 20px;
		border-radius: 10px;
		border: 2px solid rgb(35, 222, 255);
		background: rgba(27, 28, 91, 0.46);
	}
	.crew-card h3 {
		margin: 0;
	}
	.desc {
		display: flex;
		align-items: flex-end;
	}
</style>
