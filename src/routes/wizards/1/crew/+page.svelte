<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import background from '/static/backgrounds/lab-1.webp'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import RadioGroup from '$lib/components/RadioGroup.svelte'
	import RadioGroupItem from '$lib/components/RadioGroupItem.svelte'
	import CrewCard from './CrewCard.svelte'
	import { characters as charactersList } from '$lib/model/statics/characters'
	import { store } from '$lib/model/store'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	const pictures = import.meta.glob('/static/illustrations/characters/*.webp')

	let characters = charactersList
	let error = ''

	let idToImage: Record<string, string> = {}

	let you = store.project.getPlayer()
	let colleague = store.project.getColleague()
	const showBack = store.project.getMaterial() !== null
	updCharacters()

	onMount(async () => {
		const res: typeof idToImage = {}
		for (const character of characters) {
			res[character.id] = ((await pictures[character.image]()) as any).default
		}
		idToImage = res
	})

	function handleSubmit(event: Event) {
		event.preventDefault()
		if (!you) {
			error = 'Please select a character for you'
		} else if (!colleague) {
			error = 'Please select a character for your colleague'
		} else {
			error = ''
			if (showBack) goto('/project/overview')
			else goto('/wizards/1/material')
		}
	}

	function handleChange(event: CustomEvent<string>) {
		if (!you) {
			store.project.setPlayer(event.detail)
			you = store.project.getPlayer()
		} else if (!colleague) {
			store.project.setColleague(event.detail)
			colleague = store.project.getColleague()
		}
		updCharacters()
	}

	function updCharacters() {
		characters = charactersList.filter((c) => c.id !== you?.id && c.id !== colleague?.id)
	}

	function rmMe() {
		store.project.setPlayer(null)
		you = null
		updCharacters()
	}

	function rmColleague() {
		store.project.setColleague(null)
		colleague = null
		updCharacters()
	}
</script>

<svelte:head>
	<title>Choose Your Crew</title>
</svelte:head>
<Background src={background}>
	<form on:submit={handleSubmit} data-page="choose-crew">
		<Panel>
			<Title>Choose Your Crew!</Title>
			<p>So, who are you and your colleague? You need to select the founders of your company.</p>
			{#if !you}
				<p>First, let's start with you. Who are you?</p>
			{:else if !colleague}
				<p>Now, let's move on to your colleague. Who are they?</p>
			{/if}
			<div class="crew" data-testid="crew-selected">
				{#if you}
					<CrewCard img={idToImage[you.id]} title="You" name={you.name} on:rm={rmMe} />
				{/if}
				{#if colleague}
					<CrewCard
						img={idToImage[colleague.id]}
						title="Your colleague"
						name={colleague.name}
						on:rm={rmColleague}
					/>
				{/if}
			</div>
			<RadioGroup name="character" columns={2} on:change={handleChange}>
				{#each characters as character}
					<RadioGroupItem value={character.id}>
						<WaitingImage
							src={idToImage[character.id]}
							alt={character.name}
							height={80}
							width={80}
							style="margin-top: 1rem; margin-right: 1rem;"
						/>
						<div class="char-card">
							<h3>{character.name}</h3>
							<p>{character.description}</p>
						</div>
					</RadioGroupItem>
				{/each}
			</RadioGroup>
			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}
			<svelte:fragment slot="footer">
				{#if showBack}
					<Button tag="a" style="margin-right: 1rem;" href="/wizards/1/material">Back</Button>
				{/if}
				<Button type="submit">Go!</Button>
			</svelte:fragment>
		</Panel>
	</form>
</Background>

<style>
	.char-card p {
		margin: 0.5rem 0;
	}
	.char-card h3 {
		margin: 0.8rem 0;
	}

	.crew {
		display: grid;
		gap: 20px;
		grid-template-columns: repeat(2, 1fr);
		margin-bottom: 1rem;
	}
	.error {
		background-color: rgb(86, 102, 119);
		padding: 10px;
		border-radius: 10px;
		border: solid 2px rgb(253, 121, 121);
	}
</style>
