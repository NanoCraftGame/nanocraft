<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import RadioGroup from '$lib/components/RadioGroup.svelte'
	import RadioGroupItem from '$lib/components/RadioGroupItem.svelte'
	import background from '/static/backgrounds/lab-1.webp'
	import { materials } from '$lib/model/statics/materials'
	import { store } from '$lib/model/store'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'

	let selectedMaterial = ''
	let error = ''
	let idToImage: Record<string, string> = {}

	onMount(async () => {
		const res: typeof idToImage = {}
		for (const material of materials) {
			res[material.id] = (await import(material.image)).default
		}
		idToImage = res
	})

	function handleSubmit(event: Event) {
		event.preventDefault()
		if (!selectedMaterial) {
			error = 'Please select a material'
		} else {
			error = ''
			store.project.setMaterial(selectedMaterial)
			goto('/wizards/1/founders')
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
	<form on:submit={handleSubmit}>
		<Panel>
			<Title>Choose material</Title>
			<p>
				You and your colleague just invented a new material. This material has potential to
				revolutionize the industry. <br /> Which material did you invent?
			</p>
			<RadioGroup on:change={handleChange} name="material">
				{#each materials as material}
					<RadioGroupItem value={material.id}>
						<WaitingImage
							src={idToImage[material.id]}
							alt={material.name}
							height={80}
							width={80}
							style="margin-top: 1rem; margin-right: 1rem;"
						/>
						<div class="card">
							<h3>{material.name}</h3>
							<p><strong>Type: {material.type}</strong></p>
							<p><strong>Use Cases:</strong> {material.desc.useCases}</p>
							<p><strong>Market Size:</strong> {material.desc.targetMarket}</p>
							<p><strong>Challenges:</strong> {material.desc.challenges}</p>
						</div>
					</RadioGroupItem>
				{/each}
			</RadioGroup>
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
			<Button slot="footer" type="submit">Go!</Button>
		</Panel>
	</form>
</Background>

<style>
	.card p {
		margin: 0.5rem 0;
	}
	.card h3 {
		margin: 0.8rem 0;
	}
	.error {
		background-color: rgb(86, 102, 119);
		padding: 10px;
		border-radius: 10px;
		border: solid 2px rgb(253, 121, 121);
	}
</style>
