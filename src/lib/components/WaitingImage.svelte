<script lang="ts">
	import type { Writable } from 'svelte/store'

	export let src: Writable<string>
	export let alt: string | undefined
	export let width: number
	export let height: number
	export let style = ''
	style = `width: ${width}px; height: ${height}px; ${style}`
</script>

{#if $src}
	<enhanced:img {style} src={$src} {alt} sizes={`${width}px`} {...$$restProps} />
{:else}
	<div {style} {...$$restProps} />
{/if}
