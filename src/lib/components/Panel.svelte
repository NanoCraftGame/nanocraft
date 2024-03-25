<div class="panel" {...$$restProps}>
	<slot />
	{#if $$slots.footer}
		<div class="footer">
			<slot name="footer" />
		</div>
	{/if}
</div>

<style>
	.panel {
		background-color: rgba(23, 41, 85, 0.61);
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
		border: 2px solid rgb(35, 222, 255);
		color: rgb(255, 255, 255);
		max-width: 960px;
		margin: 3rem 0;
	}
	.footer {
		display: flex;
		justify-content: end;
		margin-top: 1rem;
	}
	@media (max-width: 480px) {
		.panel {
			padding: 10px;
			max-width: 100%;
			margin: 0;
			border: 0;
			border-radius: 0;
		}
	}
</style>
