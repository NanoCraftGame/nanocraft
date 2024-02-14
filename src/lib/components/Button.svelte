<script lang="ts">
	export let tag: 'button' | 'a' = 'button';
</script>

<svelte:element this={tag} class="button" {...$$restProps}>
	<slot />
</svelte:element>

<style>
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
