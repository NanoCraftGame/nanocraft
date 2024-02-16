<script lang="ts">
	export let tag: 'button' | 'a' = 'button'
	export let size: 'small' | 'medium' | 'large' = 'medium'
</script>

<svelte:element
	this={tag}
	class="button {size}"
	{...$$restProps}
	on:click
	role="button"
	tabindex={0}
>
	<slot />
</svelte:element>

<style>
	.button {
		text-decoration: none;
		display: inline-block;
		border: 2px solid #00f;
		border-radius: 5px;
		background-color: #00f;
		color: white;
		font-size: 1.2em;
		cursor: pointer;
	}

	.button.small {
		padding: 5px 10px;
	}
	.button.medium {
		padding: 10px 20px;
	}
	.button.large {
		padding: 15px 30px;
	}

	.button:hover {
		background-color: white;
		color: #00f;
	}
</style>
