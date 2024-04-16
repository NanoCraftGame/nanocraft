<script lang="ts">
	import type { Writable } from 'svelte/store'

	export let src: Writable<string>
	export let alt: string | undefined
	export let width: number
	export let height: number
	export let style = ''
	style = `width: ${width}px; height: ${height}px; ${style}`
	const sizes = `(min-width: 1200px) ${width}px, (min-width: 992px) ${width * 0.9}px,(min-width: 768px) ${width * 0.9 ** 2}px, ${width * 0.9 ** 3}px`
</script>

{#if $src}
	<enhanced:img {style} src={$src} {alt} {sizes} {...$$restProps} />
{:else}
	<div {style} {...$$restProps} />
{/if}
