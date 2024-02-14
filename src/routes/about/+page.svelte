<svelte:head>
	<title>Manual</title>
</svelte:head>
<div class="background">
	<div class="panel">
		<p>This is a dummy page where we will display the manual for the game</p>
	</div>
</div>

<style>
	.background {
		background-image: url('../../static/backgrounds/factory-1.webp');
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
</style>
