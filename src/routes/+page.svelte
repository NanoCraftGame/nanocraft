<script>
	import factoryBackground from '/static/backgrounds/factory-1.webp';
	import labBackground from '/static/backgrounds/lab-1.webp';
</script>

<svelte:head>
	<link rel="preload" href={factoryBackground} as="image" />
	<link rel="preload" href={labBackground} as="image" />
</svelte:head>
<div class="background">
	<div class="panel">
		<h1 class="title">NanoCraft</h1>
		<h2 class="subtitle">Start your own novel material production line</h2>
		<div>
			<a href="./select-material" class="button" style="margin-right: 1em;">Get Started</a>
			<a href="./about" class="button">Learn More</a>
		</div>
	</div>
</div>

<!-- 
    The page displays background/factory-1.webp as a background and a panel with a 
    "NanoCraft" title and a subtitle "Start your own novel material production line"; 
    Two buttons are displayed: "Get Started" and "Learn More".
    The panel hovers over the background image. It has glowing blue borders and a
    shadow. The panel is centered on the page.
-->
<style>
	.background {
		background-image: url('/static/backgrounds/factory-1.webp');
		background-size: cover;
		background-position: center;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.panel {
		background-color: rgba(23, 41, 85, 0.61);
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
		border: 2px solid rgb(35, 222, 255);
		text-align: center;
		color: rgb(255, 255, 255);
	}

	.title {
		font-size: 2em;
		margin-bottom: 1.2rem;
		font-weight: bold;
	}

	.subtitle {
		font-size: 1.5em;
		color: #e5e5e5;
		margin-bottom: 1rem;
	}

	.button {
		text-decoration: none;
		display: inline-block;
		padding: 10px 20px;
		border: 2px solid #00f;
		border-radius: 5px;
		background-color: #00f;
		color: white;
		font-size: 1.2em;
		cursor: pointer;
	}

	.button:hover {
		background-color: white;
		color: #00f;
	}
</style>
