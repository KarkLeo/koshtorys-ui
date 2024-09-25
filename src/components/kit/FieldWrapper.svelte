<script lang="ts">
	export let label: string = '';
	export let message: string = '';
	export let error: boolean = false;
	export let required: boolean = false;
</script>

<div class={`wrapper ${error ? 'error' : ''}`}>
	<label class="inner">
		<span class="label"
			>{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</span>
		<span class="field">
			<slot />
		</span>
	</label>
	{#if message}
		<div class="message">{message}</div>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.label {
		font-size: var(--font-size-text-sm);
		line-height: var(--line-height-text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--text-secondary);
	}

	.required {
		color: var(--text-brand-tertiary);
	}

	.field {
		position: relative;
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
</style>
