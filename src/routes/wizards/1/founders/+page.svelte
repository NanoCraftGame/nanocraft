<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import background from '/static/backgrounds/lab-1.webp'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import WaitingImage from '$lib/components/WaitingImage.svelte'
	import RadioGroup from '$lib/components/RadioGroup.svelte'
	import RadioGroupItem from '$lib/components/RadioGroupItem.svelte'
	import { characters } from '$lib/model/statics/characters'
	import { onMount } from 'svelte'
	let error = ''

	let idToImage: Record<string, string> = {}

	onMount(async () => {
		const res: typeof idToImage = {}
		for (const character of characters) {
			res[character.id] = (await import(character.image)).default
		}
		idToImage = res
	})
</script>

<svelte:head>
	<title>Choose Your Crew</title>
</svelte:head>
<Background src={background}>
	<form on:submit={handleSubmit}>
		<Panel>
			<Title>Choose Your Crew!</Title>
			<RadioGroup name="character" columns={2}>
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
			<Button slot="footer" type="submit">Go!</Button>
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
		display: flex;
		justify-content: space-around;
		margin-bottom: 1rem;
	}
	.error {
		background-color: rgb(86, 102, 119);
		padding: 10px;
		border-radius: 10px;
		border: solid 2px rgb(253, 121, 121);
	}
</style>
