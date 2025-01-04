<script lang="ts">
	import { derived, type Readable, type Writable, writable } from 'svelte/store';

	let selectedDate: Writable<Date | null> = writable(null);
	let currentDate = new Date();
	const displayedMonth = writable(currentDate.getMonth());
	const displayedYear = writable(currentDate.getFullYear());

	const months = [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь'
	];
	const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

	function selectDate(day: number) {
		console.log('selectDate', day);
		selectedDate.set(new Date($displayedYear, $displayedMonth, day));
	}

	function changeMonth(offset: number) {
		displayedMonth.update((n) => (n += offset));
		if ($displayedMonth < 0) {
			displayedMonth.set(11);
			displayedYear.update((n) => (n -= 1));
		} else if ($displayedMonth > 11) {
			displayedMonth.set(0);
			displayedYear.update((n) => (n += 1));
		}
	}

	function getDaysInMonth(month: number, year: number) {
		const date = new Date(year, month + 1, 0);
		return date.getDate();
	}

	function isSelected(day: number): boolean {
		return Boolean(
			$selectedDate &&
				$selectedDate.getDate() === day &&
				$selectedDate.getMonth() === $displayedMonth &&
				$selectedDate.getFullYear() === $displayedYear
		);
	}

	const daysInMonth: Readable<number[]> = derived(
		[displayedMonth, displayedYear],
		([displayedMonth, displayedYear]) => {
			const totalDays = getDaysInMonth(displayedMonth, displayedYear);
			return Array.from({ length: totalDays }, (_, i) => i + 1);
		}
	);
</script>

<div class="calendar">
	<div class="calendar-header">
		<button on:click={() => changeMonth(-1)}>&lt;</button>
		<span>{months[$displayedMonth]} {$displayedYear}</span>
		<button on:click={() => changeMonth(1)}>&gt;</button>
	</div>

	<div class="calendar-grid">
		{#each weekdays as weekday}
			<div>{weekday}</div>
		{/each}
		{#each $daysInMonth as day}
			<button class:selected={isSelected(day)} on:click={() => selectDate(day)}>
				{day}
			</button>
		{/each}
	</div>
</div>

<style>
	.calendar {
		display: inline-block;
		border: 1px solid #ccc;
		padding: 1rem;
		background-color: white;
		border-radius: 8px;

		color: black;
	}

	.calendar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.calendar-grid div {
		padding: 8px;
		text-align: center;
		cursor: pointer;
	}

	.calendar-grid .selected {
		background-color: #007bff;
		color: white;
		border-radius: 50%;
	}

	.calendar-grid div:hover {
		background-color: #f0f0f0;
	}
</style>
