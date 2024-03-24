<script lang="ts">
	export let tag: 'button' | 'a' = 'button'
	export let size: 'small' | 'medium' | 'large' = 'medium'
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary'
</script>

<svelte:element
	this={tag}
	class={['button', variant, size].join(' ')}
	{...$$restProps}
	on:click
	role="button"
	tabindex={0}
>
	<slot />
</svelte:element>

<style>
	/* TODO add styles for disabled state */
	.button {
		text-decoration: none;
		display: inline-block;
		border-radius: 5px;
		font-size: 1.2em;
		cursor: pointer;
	}
	.button.primary {
		background-color: #00f;
		border: 2px solid #00f;
		color: white;
	}
	.button.secondary {
		background-color: transparent;
		border: 1px solid #00f;
		color: rgb(0, 0, 0);
	}
	.button.ghost {
		background-color: transparent;
		border: none;
		color: inherit;
	}
	.button.primary:hover {
		background-color: white;
		color: #00f;
	}
	.button.secondary:hover {
		outline: 1px solid #00f;
		color: #00f;
	}

	.button.small {
		font-size: small;
		padding: 5px 10px;
	}
	.button.medium {
		padding: 10px 20px;
	}
	.button.large {
		padding: 15px 30px;
	}
</style>
