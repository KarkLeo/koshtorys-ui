<script lang="ts">
	export let label: string = '';
	export let description: string = '';
	export let message: string = '';
	export let error: boolean = false;
</script>

<div class={`wrapper ${error ? 'error' : ''}`}>
	<div class="inner">
		<div class="texts">
			<h3 class="label">{label}</h3>
			<p class="description">{description}</p>
		</div>

		<div class="control">
			<slot />
			<div class="message">{message}</div>
		</div>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--spacing-xl) 0;

		border-top: 1px solid var(--border-secondary);
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
		max-width: var(--width-2xl);
		width: 100%;
	}

	.label {
		margin: 0;

		font-size: var(--font-size-text-sm);
		line-height: var(--line-height-text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
	}

	.description {
		margin: 0;

		font-size: var(--font-size-text-sm);
		line-height: var(--line-height-text-sm);
		font-weight: var(--font-weight-regular);
		color: var(--text-tertiary);
	}

	.message {
		font-size: var(--font-size-text-sm);
		line-height: var(--line-height-text-sm);
		font-weight: var(--font-weight-regular);
		color: var(--text-tertiary);
	}

	.error .message {
		color: var(--text-error-primary);
	}

	@media screen and (min-width: 768px) {
		.wrapper {
			padding: var(--spacing-2xl) 0;
		}

		.inner {
			display: grid;
			grid-template-columns: 6fr 4fr;
			gap: var(--spacing-4xl);
		}

		.label {
			font-size: var(--font-size-text-md);
			line-height: var(--line-height-text-md);
		}

		.message {
			min-height: var(--line-height-text-sm);
		}
	}
</style>
