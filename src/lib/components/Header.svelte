<script lang="ts">
	import Button from './Button.svelte'
	import Drawer from './Drawer.svelte'
	import { store } from '$lib/model/store'

	let speed = store.timer.getTempo()

	export let current: 'project' | 'inventory' | 'reports' = 'project'

	let drawerOpen = false

	function toggleDrawer() {
		drawerOpen = !drawerOpen
	}

	function setSpeed(event: Event) {
		const target = event.target as HTMLInputElement
		speed = parseInt(target.value)
		store.timer.setTempo(speed)
	}
</script>

<div class="header">
	<div class="header-left">
		<a href="/project/overview" class:current={current === 'project'}>Project Overview</a>
		<a href="/inventory" class:current={current === 'inventory'}>Inventory</a>
		<a href="/reports" class:current={current === 'reports'}>Reports</a>
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
	<h3>Simulation speed: {speed}</h3>
	<input type="range" min="1" max="100" value={speed} on:input={setSpeed} />
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
