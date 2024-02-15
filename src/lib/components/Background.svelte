<script lang="ts">
	export let src: string
</script>

<div class="background" style="background-image: url({src});">
	<div class="inner">
		<slot />
	</div>
</div>

<style>
	.background {
		background-size: cover;
		background-position: center;
		height: 100vh;
		display: flex;
		align-items: center;
	}
	.inner {
		max-height: 100vh;
		width: 100%;
		display: flex;
		justify-content: center;
		overflow-y: auto;
	}
</style>
