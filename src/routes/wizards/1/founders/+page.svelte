<script lang="ts">
	import mxene from '/static/illustrations/mxene.jpg'
	import ionicLiquid from '/static/illustrations/ionic-liquid.png'
	import Button from '$lib/components/Button.svelte'
	import Background from '$lib/components/Background.svelte'
	import background from '/static/backgrounds/lab-1.webp'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import { store } from '$lib/model/store'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	let selectedMaterial = ''
	let error = ''
	type Character = {
		name: string
		description: string
		image: string
	}
	let characters: Character[] = []

	onMount(async () => {
		characters = [
			{
				name: 'Dr. Lena Nguyen',
				description:
					'Dr. Nguyen is a visionary physicist known for her dynamic approach to material science. She excels at theoretical modeling but can get lost in abstract concepts. Her background in quantum computing fuels her pursuit of advanced materials.',
				image: (await import('/static/illustrations/characters/lena-nguyen.webp')).default,
			},
			{
				name: 'Dr. Hugo Martinez',
				description:
					"Dr. Martinez is a charismatic and dedicated materials engineer with a passion for sustainable development. He's excellent at team building and leadership, although he can be overly optimistic about project timelines. His background in renewable energy solutions drives his innovative work.",
				image: (await import('/static/illustrations/characters/hugo-martinez.webp')).default,
			},
			{
				name: ' Dr. Ava Singh',
				description:
					'Dr. Singh is a highly intuitive and brilliant biochemist specializing in nanomaterials. Her strengths lie in her innovative research and quick problem-solving skills, though her impatience for results can sometimes lead to hasty decisions. Her background is in biotechnology startups.',
				image: (await import('/static/illustrations/characters/ava-singh.webp')).default,
			},
			{
				name: 'Dr. Eli Wallace',
				description:
					"Dr. Wallace is a thoughtful and perceptive mechanical engineer with a specialty in robotics and automation for material manufacturing. He's known for his strategic thinking and efficient solutions, but can be overly cautious, sometimes missing out on bold innovations. His background includes aeronautical engineering.",
				image: (await import('/static/illustrations/characters/eli-wallace.webp')).default,
			},
			{
				name: 'Dr. Nora Kim',
				description:
					'Dr. Kim is an electrical engineer with a passion for developing energy-efficient materials. Known for her innovative thinking and persistence, she sometimes struggles with delegation, preferring to tackle challenges herself. Her expertise is in solar cell technology.',
				image: (await import('/static/illustrations/characters/nora-kim.webp')).default,
			},
			{
				name: 'Dr. Samuel Adekunle',
				description:
					"Dr. Adekunle is a charismatic material scientist specializing in graphene and advanced composite materials. His innovative approach and leadership skills make him a key team member, though his ambition sometimes leads him to take on too much. He's deeply involved in mentorship programs for young scientists.",

				image: (await import('/static/illustrations/characters/samuel-adekunle.webp')).default,
			},
		]
		console.log(characters)
	})

	function handleSubmit(event: Event) {
		event.preventDefault()
		const form = event.target as HTMLFormElement
		const formData = new FormData(form)
		const material = formData.get('material') as string
		if (!material) {
			error = 'Please select a material'
		} else {
			error = ''
			store.project.setMaterial(material)
			goto('/wizards/1/founders')
		}
	}
</script>

<svelte:head>
	<title>Select material</title>
</svelte:head>
<Background src={background}>
	<form on:submit={handleSubmit}>
		<Panel>
			<Title>Select Your Crew!</Title>
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
							<img src={character.image} alt={character.name} />
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
		width: 80px;
		height: 80px;
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
