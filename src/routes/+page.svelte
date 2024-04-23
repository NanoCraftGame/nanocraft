<script>
	import Button from '$lib/components/Button.svelte'
	import factoryBackground from '/src/static/backgrounds/factory-1.webp'
	import labBackground from '/src/static/backgrounds/lab-1.webp'
	import background from '/src/static/backgrounds/factory-1.webp'
	import Background from '$lib/components/Background.svelte'
	import Panel from '$lib/components/Panel.svelte'
	import Title from '$lib/components/typography/title.svelte'
	import Subtitle from '$lib/components/typography/subtitle.svelte'
</script>

<svelte:head>
	<title>NanoCraft</title>
	<link href={factoryBackground} as="image" />
	<link href={labBackground} as="image" />
</svelte:head>
<Background src={background}>
	<Panel style="text-align: center;">
		<Title>NanoCraft</Title>
		<Subtitle>Start your own novel material production line</Subtitle>
		<div>
			<Button tag="a" href="/wizards/1/material" style="margin-right: 1em;">Get Started</Button>
			<Button tag="a" href="/about">Learn More</Button>
		</div>
	</Panel>
</Background>
