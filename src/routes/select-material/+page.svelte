<script lang="ts">
	import mxene from '/static/illustrations/mxene.jpg';
	import ionicLiquid from '/static/illustrations/ionic-liquid.png';
	import Button from '../../lib/components/Button.svelte';
	import Background from '../../lib/components/Background.svelte';
	import background from '/static/backgrounds/lab-1.webp';
	import Panel from '../../lib/components/Panel.svelte';
	let selectedMaterial = '';

	function handleSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const material = formData.get('material') as string;
		alert(`You selected ${material}`);
	}
</script>

<svelte:head>
	<title>Select material</title>
</svelte:head>
<Background src={background}>
	<Panel>
		<h1 class="title">Select material</h1>
		<p>
			You and your colleague just invented a new material. This material has potential to
			revolutionize the industry. <br /> Which material did you invent?
		</p>
		<form on:submit={handleSubmit}>
			<ul>
				<li class="radio-select" class:selected={selectedMaterial === 'mxene'}>
					<input
						type="radio"
						id="mxene"
						name="material"
						value="mxene"
						bind:group={selectedMaterial}
					/>
					<label for="mxene">
						<img src={mxene} alt="MXene" />
						<div>
							<h3>FlexiMax-Ti3C2</h3>
							<p>
								<strong>Use Cases:</strong> High-capacity, flexible batteries for wearables and foldable
								electronics; ultra-sensitive, wearable health monitoring sensors.
							</p>
							<p>
								<strong>Market Size:</strong> Targeting a combined market projected to exceed $30 billion
								by 2030.
							</p>
							<p>
								<strong>Challenges:</strong> Scalable synthesis maintaining material flexibility and
								conductivity; optimization of electrode integration for energy devices without compromising
								material integrity.
							</p>
						</div>
					</label>
				</li>
				<li class="radio-select" class:selected={selectedMaterial === 'ionic-liquid'}>
					<input
						type="radio"
						id="ionic-liquid"
						name="material"
						value="ionic-liquid"
						bind:group={selectedMaterial}
					/>
					<label for="ionic-liquid">
						<img src={ionicLiquid} alt="Ionic Liquid" />
						<div>
							<h3>ElectroIon-Gel</h3>
							<p>
								<strong>Use Cases:</strong> Non-volatile, high-temperature electrolytes for advanced
								battery technologies; green solvents for pharmaceuticals and chemical synthesis.
							</p>
							<p>
								<strong>Market Size:</strong> Poised to capture sectors within the $12 billion advanced
								battery market and the $8 billion green solvent market by 2030.
							</p>
							<p>
								<strong>Challenges:</strong> Enhancing ionic conductivity while ensuring thermal stability;
								developing cost-effective, large-scale production methods.
							</p>
						</div>
					</label>
				</li>
			</ul>
			<div class="footer">
				<Button type="submit">Submit</Button>
			</div>
		</form>
	</Panel>
</Background>

<style>
	.footer {
		display: flex;
		justify-content: end;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	.radio-select {
		margin: 20px 0;
		padding: 20px;
		border: 2px solid #00f;
		border-radius: 10px;
		background-color: rgba(0, 0, 255, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}
	.radio-select * {
		cursor: pointer;
	}
	.radio-select:hover {
		background-color: rgba(0, 0, 255, 0.7);
	}
	.radio-select p {
		margin: 0.5rem 0;
	}
	.radio-select h3 {
		margin: 0.8rem 0;
	}
	.radio-select img {
		width: 80px;
		height: 80px;
		margin-right: 1rem;
		margin-top: 1rem;
	}
	.radio-select label {
		display: flex;
	}
	.radio-select input {
		display: none;
	}
	.radio-select.selected {
		border: 2px solid rgb(101, 240, 255);
	}
</style>
