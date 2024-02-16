<script lang="ts">
	export let src: string | undefined
	export let alt: string | undefined
	export let width: number
	export let height: number
	export let style = ''
	style = `width: ${width}px; height: ${height}px; ${style}`
</script>

{#if src}
	<img {style} {src} {alt} {...$$restProps} />
{:else}
	<div {style} {...$$restProps} />
{/if}
