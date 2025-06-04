<script lang="ts">
	import ThemeSwitch from '$lib/components/themeSwitch/themeSwitch.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CalendarDate } from '@internationalized/date';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Logo from '../logo/logo.svelte';
	import DisplayList from '../displayList/displayList.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { RangeCalendar } from '../ui/range-calendar';
	import { getDateRange } from '$lib/utils';
	import { getWeek, getYear } from 'date-fns';
	import { selectedPeriod, type VoteAmount } from '$lib/shared.svelte';
	import Badge from '../ui/badge/badge.svelte';
	import { createQuery } from '@tanstack/svelte-query';
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

	// async function getVotes() {
	// 	console.log('running getvotes');

	// 	const response = await fetch(`/api/votes`);
	// 	let data = await response.json();
	// 	votes = data;
	// }
	// onMount(async () => {
	// 	if (!votes) {
	// 		await getVotes();
	// 	}
	// });
	const getVotes = async () => {
		const res = await fetch(`/api/votes`);

		return await res.json();
	};

	const query = createQuery({
		queryKey: ['votes'],
		queryFn: () => getVotes()
	});
</script>

<div
	class="bg-primary-foreground/80 fixed flex w-full items-center justify-between gap-5 p-2 backdrop-blur"
>
	<div class="flex items-center gap-2">
		<a href="/" class="flex items-center gap-2">
			<Logo />
			<h1 class="text-lg font-bold">Sub Sunday</h1>
		</a>
		<a href="/about">
			<Button size={'sm'} class="ml-5">How to vote</Button>
		</a>
	</div>
	<div>
		<Popover.Root>
			<Popover.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}
				><CalendarIcon /></Popover.Trigger
			>
			<Popover.Content
				class=" m-0 flex flex !w-fit flex-col  items-center justify-center border-none p-0"
			>
				<!-- <Calendar type="single" bind:value class="rounded-md border" /> -->
				<div class="absolute top-2 font-mono text-xs">
					#: {getWeek(value.start.toDate('America/New_York'))}.{getYear(
						value.start.toDate('America/New_York')
					)}
				</div>
				<RangeCalendar
					{value}
					readonly
					onStartValueChange={(e) => {
						handleSelect(e);
					}}
					class="rounded-md border pt-10"
				/>
			</Popover.Content>
		</Popover.Root>
		<DisplayList />
	</div>
	<div class="flex gap-10 font-mono text-xs">
		<span>
			Votes this Weeks <Badge>{$query.data && $query.data.votesThisPeriod}</Badge>
		</span>
		<span>
			Votes today <Badge>{$query.data && $query.data.votesToday}</Badge>
		</span>
	</div>
	<div>
		<ThemeSwitch />
	</div>
</div>
