<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import Check from '$lib/icons/Check.svelte';

	export let selected: string | null = null;
	export let options: string[] = [];
	let isOpen = false;

	let dropdownRef: HTMLDivElement | null = null;
	let buttonRef: HTMLButtonElement | null = null;
	let listRef: HTMLUListElement | null = null;
	let selectedIndex = -1;

	export let getOptionLabel: (option: string) => string = (option: string) => option;

	async function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			await tick();
			if (listRef) listRef.focus();
		}
	}

	async function selectOption(option: string, index: number) {
		selected = option;
		selectedIndex = index;
		isOpen = false;
		await tick();
		if (buttonRef) {
			buttonRef.focus();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		switch (event.key) {
			case 'ArrowDown':
				if (selectedIndex < options.length - 1) {
					selectedIndex++;
				} else {
					selectedIndex = 0;
				}
				break;
			case 'ArrowUp':
				if (selectedIndex > 0) {
					selectedIndex--;
				} else {
					selectedIndex = options.length - 1;
				}
				break;
			case 'Enter':
				if (selectedIndex >= 0 && selectedIndex < options.length) {
					selectOption(options[selectedIndex], selectedIndex);
				}
				break;
			case 'Escape':
				selectedIndex = options.indexOf(selected || '');
				isOpen = false;
				if (buttonRef) {
					buttonRef.focus();
				}
				break;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="dropdown" bind:this={dropdownRef}>
	<button
		class="dropdown-toggle"
		class:open={isOpen}
		on:click={toggleDropdown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		bind:this={buttonRef}
	>
		{#if selected}
			<span class="selected-option">{getOptionLabel(selected)}</span>
		{:else}
			<span class="placeholder">Выберите опцию</span>
		{/if}
		<ChevronDown class="chevron" />
		<span class="outline"></span>
	</button>
	{#if isOpen}
		<ul
			class="dropdown-menu"
			role="listbox"
			tabindex="0"
			on:keydown={handleKeyDown}
			bind:this={listRef}
		>
			{#each options as option, index}
				<li class="dropdown-item">
					<button
						role="option"
						aria-selected={selectedIndex === index}
						tabindex="-1"
						class:selected={selectedIndex === index}
						class="dropdown-item-handler"
						on:click={(e) => {
							e.preventDefault();
							selectOption(option, index);
						}}
					>
						<span class="option">{getOptionLabel(option)}</span>
						{#if option === selected}
							<Check class="check" />
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-toggle {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--spacing-md);
		padding: 10px 14px;
		box-sizing: border-box;

		font-size: var(--font-size-text-md);
		line-height: var(--line-height-text-md);
		font-weight: var(--font-weight-regular);

		background-color: var(--bg-primary);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		cursor: pointer;
	}
	.dropdown-toggle:focus {
		outline: none;
	}
	.dropdown-toggle:disabled {
		color: var(--text-disabled);

		background-color: var(--bg-disabled_subtle);
	}

	.placeholder {
		color: var(--text-placeholder);
	}
	.selected-option {
		color: var(--text-primary);
	}
	.dropdown-toggle :global(.chevron) {
		width: 20px;
		height: 20px;

		color: var(--fg-tertiary);
	}

	.outline {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;

		display: block;
		width: 100%;
		height: 100%;
		box-sizing: border-box;

		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);

		pointer-events: none;
	}
	.dropdown-toggle:focus .outline,
	.dropdown-toggle.open .outline {
		border: 2px solid var(--border-brand);
	}
	.dropdown-toggle:disabled .outline {
		border: 1px solid var(--border-disabled);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + var(--spacing-xs));
		left: 0;
		z-index: 1000;

		width: 100%;
		max-height: 320px;
		box-sizing: border-box;
		margin: 0;
		padding: var(--spacing-xs) 0;

		list-style: none;
		background: var(--bg-primary);
		border: 1px solid var(--border-secondary);
		border-radius: var(--radius-md);
		box-shadow:
			0 4px 6px -2px rgba(16, 24, 40, 0.03),
			0 12px 16px -4px rgba(16, 24, 40, 0.08);
		outline: none;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		justify-content: stretch;
		margin: 0;
		padding: 1px var(--spacing-sm);
		box-sizing: border-box;
	}

	.dropdown-item-handler {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		width: 100%;
		padding: 10px 10px 10px var(--spacing-md);

		font-size: var(--font-size-text-md);
		line-height: var(--line-height-text-md);
		color: var(--text-primary);
		font-weight: var(--font-weight-medium);
		text-align: left;

		background: none;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.dropdown-item-handler :global(.check) {
		width: 20px;
		height: 20px;

		color: var(--fg-brand-primary);
	}
	.option {
		white-space: nowrap;
	}

	.dropdown-item-handler:hover,
	.dropdown-item-handler.selected {
		background-color: var(--bg-active);
	}
</style>
