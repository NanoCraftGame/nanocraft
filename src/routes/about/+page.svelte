<script>
	import Background from '$lib/components/Background.svelte'
	import Panel from '$lib/components/Panel.svelte'
	import background from '/src/static/backgrounds/factory-1.webp'
</script>

<svelte:head>
	<title>Manual</title>
</svelte:head>
<Background src={background}>
	<Panel>
		<p>This is a dummy page where we will display the manual for the game</p>
	</Panel>
</Background>
