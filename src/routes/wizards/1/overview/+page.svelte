<script lang="ts">
	import { onMount } from 'svelte'
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import background from '/src/static/backgrounds/lab-1.webp'
	import { store } from '$lib/model/store'
	import { goto } from '$app/navigation'
	let material = store.project.getMaterial()
	let you = store.project.getPlayer()
	let colleague = store.project.getColleague()

	onMount(async () => {
		if (!material) {
			goto('/wizards/1/material')
			return
		}
		if (!you || !colleague) {
			goto('/wizards/1/crew')
			return
		}
	})
</script>

<svelte:head>
	<title>Overview</title>
</svelte:head>
<Background src={background}>
	<Panel>
		<Title>Overview</Title>
		<p>Everything ready to go! Review your choices.</p>
		{#if material}
			<h3>Selected Material:</h3>
			<div class="card">
				<WaitingImage
					style="margin-right: 1rem;"
					src={material.image}
					alt={material.name}
					width={80}
					height={80}
				/>
				<p>{material.name}</p>
			</div>
		{/if}
		<h3>You:</h3>
		{#if you}
			<div class="card">
				<WaitingImage
					style="margin-right: 1rem;"
					src={you.image}
					alt={you.name}
					width={80}
					height={80}
				/>
				<p>{you.name}</p>
			</div>
		{/if}
		<h3>Your Colleague:</h3>
		{#if colleague}
			<div class="card">
				<WaitingImage
					style="margin-right: 1rem;"
					src={colleague.image}
					alt={colleague.name}
					width={80}
					height={80}
				/>
				<p>{colleague.name}</p>
			</div>
		{/if}
		<svelte:fragment slot="footer">
			<Button tag="a" style="margin-right: 1rem;" href="/wizards/1/crew">Back</Button>
			<Button tag="a" href="/project">Go!</Button>
		</svelte:fragment>
	</Panel>
</Background>

<style>
	.card {
		display: flex;
		min-width: 400px;
	}
</style>
