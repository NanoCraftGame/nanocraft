<script lang="ts">
	export let src: string
</script>

<div class="background" style="background-image: url({src});">
	<slot />
</div>

<style>
	.background {
		background-size: cover;
		background-position: center;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow-y: auto;
	}
</style>
