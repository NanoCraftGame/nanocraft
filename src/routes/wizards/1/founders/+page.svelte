<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import background from '/static/backgrounds/lab-1.webp'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import { onMount } from 'svelte'
	import { characters } from '$lib/model/statics/characters'
	let selectedMaterial = ''
	let error = ''

	let idToImage: Record<string, string> = {}

	onMount(async () => {
		const res: typeof idToImage = {}
		for (const character of characters) {
			res[character.id] = (await import(character.image)).default
		}
		idToImage = res
	})

	function handleSubmit(event: Event) {
		event.preventDefault()
	}
</script>

<svelte:head>
	<title>Choose Your Crew</title>
</svelte:head>
<Background src={background}>
	<form on:submit={handleSubmit}>
		<Panel>
			<Title>Choose Your Crew!</Title>
			<p>So, who are you and your colleague? You need to select the founders of your company.</p>
			<ul>
				{#each characters as character}
					<li class="radio-select" class:selected={selectedMaterial === character.name}>
						<input
							type="radio"
							id={character.name}
							name="material"
							value={character.name}
							bind:group={selectedMaterial}
						/>
						<label for={character.name}>
							<WaitingImage
								src={idToImage[character.id]}
								alt={character.name}
								height={80}
								width={80}
								style="margin-top: 1rem; margin-right: 1rem;"
							/>
							<div>
								<h3>{character.name}</h3>
								<p>{character.description}</p>
							</div>
						</label>
					</li>
				{/each}
			</ul>
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
			<Button slot="footer" type="submit">Go!</Button>
		</Panel>
	</form>
</Background>

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
		list-style: none;
		padding: 0;
	}
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
	.radio-select p {
		margin: 0.5rem 0;
	}
	.radio-select h3 {
		margin: 0.8rem 0;
	}
	.radio-select img {
		margin-right: 1rem;
		margin-top: 1rem;
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
	.error {
		background-color: rgb(86, 102, 119);
		padding: 10px;
		border-radius: 10px;
		border: solid 2px rgb(253, 121, 121);
	}
</style>
