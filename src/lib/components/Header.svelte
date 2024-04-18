<script lang="ts">
	import Button from './Button.svelte'
	import Drawer from './Drawer.svelte'
	import { store } from '$lib/model/store'
	import { goto } from '$app/navigation'
	import { onMount, onDestroy } from 'svelte'
	import { browser } from '$app/environment'

	let speed = store.settings.tempo

	export let current: 'project' | 'inventory' | 'reports' | 'staff' = 'project'

	let drawerOpen = false

	let currentTick = 0
	store.timer.currentTick.subscribe((tick) => {
		currentTick = tick
	})

	onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeyDown)
		}
	})
	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeyDown)
		}
	})

	function handleKeyDown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			if (store.timer.isRunning) {
				store.timer.pause()
			} else {
				store.timer.resume()
			}
			event.preventDefault()
		}
	}
	function toggleDrawer() {
		drawerOpen = !drawerOpen
	}

	function setSpeed(event: Event) {
		const target = event.target as HTMLInputElement
		speed = parseInt(target.value)
		store.settings.tempo = speed
		store.timer.setTempo(speed)
	}

	function resetTasks() {
		store.reset(false)
	}

	function resetAll() {
		store.reset(true)
		goto('/wizards/1/material')
	}

	function pause() {
		store.timer.pause()
	}

	function resume() {
		store.timer.resume()
	}
</script>

<div class="header">
	<div class="header-left">
		<a href="/project" class:current={current === 'project'}>Project Overview</a>
		<a href="/inventory" class:current={current === 'inventory'}>Inventory</a>
		<a href="/reports" class:current={current === 'reports'}>Reports</a>
		<a href="/staff" class:current={current === 'staff'}>Staff</a>
	</div>
	<div>
		{(currentTick / 8).toFixed(2)} days
	</div>
	<div class="header-right">
		<Button variant="ghost" on:click={toggleDrawer}>
			<div class="menu"></div>
		</Button>
	</div>
</div>
<Drawer
	open={drawerOpen}
	on:close={() => {
		drawerOpen = false
	}}
>
	<h3>Simulation speed: {speed} hours per second</h3>
	<input type="range" min="1" max="40" value={speed} on:input={setSpeed} />
	{#if store.mode === 'developer'}
		<Button style="margin-top: 1em;" on:click={resetTasks}>Reset tasks</Button> <br />
		<Button style="margin-top: 1em;" on:click={resetAll}>Reset all</Button> <br />
	{/if}
	<Button style="margin-top: 1em;" on:click={pause}>⏸️ Pause sim</Button> <br />
	<Button style="margin-top: 1em;" on:click={resume}>▶️ Resume sim</Button> <br />
</Drawer>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgb(10, 58, 180);
		color: white;
		border-bottom: 2px solid rgb(35, 222, 255);
		height: 65px;
	}
	.header a {
		color: white;
		text-decoration: none;
		margin-right: 1rem;
	}
	.header a:hover {
		text-decoration: underline;
	}
	.header .current {
		text-decoration: underline;
	}
	.menu {
		width: 30px;
		height: 3px;
		background-color: white;
		position: relative;
		margin: 4px 0;
	}

	.menu::before,
	.menu::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: white;
	}

	.menu::before {
		top: -10px;
	}

	.menu::after {
		top: 10px;
	}
</style>
