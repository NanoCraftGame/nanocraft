<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import background from '/src/static/backgrounds/lab-1.webp'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import RadioGroup from '$lib/components/RadioGroup.svelte'
	import RadioGroupItem from '$lib/components/RadioGroupItem.svelte'
	import CrewCard from './CrewCard.svelte'
	import { store } from '$lib/model/store'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { Character, getAllFounders } from '$lib/model/character'

	let charactersList = getAllFounders()
	let characters: Character[] = []
	let error = ''

	let you = store.project.getPlayer()
	let colleague = store.project.getColleague()
	const showBack = store.project.getMaterial() !== null

	onMount(async () => {
		updCharacters()
	})

	function handleSubmit(event: Event) {
		event.preventDefault()
		if (!you) {
			error = 'Please select a character for you'
		} else if (!colleague) {
			error = 'Please select a character for your colleague'
		} else {
			error = ''
			if (showBack) goto('/wizards/1/overview')
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
					<CrewCard img={you.image} title="You" name={you.name} on:rm={rmMe} />
				{/if}
				{#if colleague}
					<CrewCard
						img={colleague.image}
						title="Your colleague"
						name={colleague.name}
						on:rm={rmColleague}
					/>
				{/if}
			</div>
			<RadioGroup name="character" columns={2} on:change={handleChange}>
				{#each characters as character}
					<RadioGroupItem value={character.id}>
						<div class="card">
							<div class="card__title">
								<div class="card__image">
									<WaitingImage src={character.image} alt={character.name} height={80} width={80} />
								</div>
								<h3 class="card__name">{character.name}</h3>
							</div>
							<div class="card__body">
								<p>{character.description}</p>
							</div>
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
	.card__title {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
	}
	.card__body p {
		margin: 0.5rem 0;
	}
	.card__name {
		margin: 0;
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

	@media (max-width: 700px) {
		.crew {
			display: flex;
			flex-direction: column;
		}
	}
	@media (max-width: 600px) {
		.card__body {
			margin-left: 0;
			margin-top: 1rem;
		}
	}
</style>
