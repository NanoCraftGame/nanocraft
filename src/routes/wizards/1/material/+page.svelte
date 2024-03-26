<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import RadioGroup from '$lib/components/RadioGroup.svelte'
	import RadioGroupItem from '$lib/components/RadioGroupItem.svelte'
	import background from '/static/backgrounds/lab-1.webp'
	import { store } from '$lib/model/store'
	import { goto } from '$app/navigation'
	import { getAllMaterials } from '$lib/model/material'

	let materials = getAllMaterials()
	let selectedMaterial = store.project.getMaterial()?.id || ''
	let error = ''
	const hasBack = store.project.getPlayer() !== null || store.project.getColleague() !== null

	function handleSubmit(event: Event) {
		event.preventDefault()
		if (!selectedMaterial) {
			error = 'Please select a material'
		} else {
			error = ''
			store.project.setMaterial(selectedMaterial)
			if (hasBack) goto('/wizards/1/overview')
			else goto('/wizards/1/crew')
		}
	}

	function handleChange(event: CustomEvent) {
		selectedMaterial = event.detail
	}
</script>

<svelte:head>
	<title>Choose material</title>
</svelte:head>
<Background src={background}>
	<form on:submit={handleSubmit} data-page="choose-material">
		<Panel>
			<Title>Choose material</Title>
			<p>
				You and your colleague just invented a new material. This material has potential to
				revolutionize the industry. <br /> Which material did you invent?
			</p>
			<RadioGroup on:change={handleChange} name="material" defaultValue={selectedMaterial}>
				{#each materials as material}
					<RadioGroupItem value={material.id}>
						<div class="card">
							<div class="card__title">
								<div class="card__image">
									<WaitingImage src={material.image} alt={material.name} height={80} width={80} />
								</div>
								<div class="card__details">
									<h3 class="card__name">{material.name}</h3>
									<p><strong>Type: {material.type}</strong></p>
								</div>
							</div>
							<div class="card__body">
								<p><strong>Use Cases:</strong> {material.desc.useCases}</p>
								<p><strong>Market Size:</strong> {material.desc.targetMarket}</p>
								<p><strong>Challenges:</strong> {material.desc.challenges}</p>
							</div>
						</div>
					</RadioGroupItem>
				{/each}
			</RadioGroup>
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
			<svelte:fragment slot="footer">
				{#if hasBack}
					<Button tag="a" style="margin-right: 1rem;" href="/wizards/1/crew">Back</Button>
				{/if}
				<Button type="submit">Go!</Button>
			</svelte:fragment>
		</Panel>
	</form>
</Background>

<style>
	.card__title {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
	}
	.card__image {
	}
	.card__body {
	}
	.card__body p {
		margin: 0.5rem 0;
	}
	.card__body h3 {
		margin: 0;
	}
	.error {
		background-color: rgb(86, 102, 119);
		padding: 10px;
		border-radius: 10px;
		border: solid 2px rgb(253, 121, 121);
	}
	@media (max-width: 600px) {
		.card {
			margin-left: 0;
			margin-top: 1rem;
		}
	}
</style>
