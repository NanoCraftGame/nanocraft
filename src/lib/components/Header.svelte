<script lang="ts">
	import Button from './Button.svelte'
	import Drawer from './Drawer.svelte'
	import { store } from '$lib/model/store'
	import { onMount } from 'svelte'
	import { Task } from '../model/tasks'
	import { goto } from '$app/navigation'

	let speed = store.settings.tempo

	export let current: 'project' | 'inventory' | 'reports' = 'project'

	let drawerOpen = false

	function toggleDrawer() {
		drawerOpen = !drawerOpen
	}

	function setSpeed(event: Event) {
		const target = event.target as HTMLInputElement
		speed = parseInt(target.value)
		store.settings.tempo = speed
		store.timer.setTempo(speed)
	}

	onMount(async () => {
		if (store.tasks.getTasks().length === 0) {
			fakeTasks()
		}
	})

	function fakeTasks() {
		const crew = [store.project.getPlayer(), store.project.getColleague()]
		if (!crew[0] || !crew[1]) {
			return
		}
		const fakeTasks = [
			new Task('Find the supplier of X', 1, 10),
			new Task('Find prospective buyers for Y', 0, 28),
			new Task('Find producer of the machine PP', 2, 10),
			new Task('Find producer of the machine ER', 3, 10),
			new Task('Find a producer of the machine QQ', 4, 10),
			new Task('Test execution of the machine ER', 5, 12),
		]
		for (const task of fakeTasks) {
			const id = crew[Math.floor(Math.random() * 3)]?.id
			if (id) task.assign(id)
			store.tasks.addTask(task)
		}
	}

	function resetTasks() {
		store.tasks.clear()
		store.timer.setTick(0)
		fakeTasks()
	}

	function resetAll() {
		store.reset()
		goto('/wizards/1/material')
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
	<h3>Simulation speed: {speed} hours per second</h3>
	<input type="range" min="1" max="40" value={speed} on:input={setSpeed} />

	<Button style="margin-top: 1em;" on:click={resetTasks}>Reset tasks</Button> <br />
	<Button style="margin-top: 1em;" on:click={resetAll}>Reset all</Button> <br />
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
