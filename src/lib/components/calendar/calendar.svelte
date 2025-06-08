<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import { RangeCalendar } from '../ui/range-calendar';
	import { getDateRange } from '$lib/utils';
	import { selectedPeriod } from '$lib/shared.svelte';
	import { Card } from '../ui/card';
	// Function to get the start (Sunday) and end (Saturday) of the week
	function toCalendar(data: { startDate: Date; endDate: Date; nextStartDate: Date }) {
		const start = new CalendarDate(
			data.startDate.getFullYear(),
			data.startDate.getMonth() + 1,
			data.startDate.getDate()
		);
		const end = new CalendarDate(
			data.endDate.getFullYear(),
			data.endDate.getMonth() + 1,
			data.endDate.getDate()
		);

		return { start, end };
	}
	function isSameRange(a: CalendarDate, b: CalendarDate) {
		return a.toDate('America/New_York').getTime() === b.toDate('America/New_York').getTime();
	}
	const today = new Date();
	let value = $state(toCalendar(getDateRange().currentPeriod));

	function handleSelect(date: CalendarDate) {
		if (!isSameRange(date, value.start)) {
			$selectedPeriod = getDateRange({ offset: date.toDate('America/New_York') });
			value = toCalendar(getDateRange({ offset: date.toDate('America/New_York') }).currentPeriod);
		}
	}
</script>

<Card class=" m-0 flex flex-col items-center justify-start gap-0 p-0">
	<RangeCalendar
		{value}
		readonly
		onStartValueChange={(e: any) => {
			handleSelect(e);
		}}
		class="m-0 rounded-md p-3"
	/>
</Card>
