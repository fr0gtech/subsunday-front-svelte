<script lang="ts">
	import ThemeSwitch from '$lib/components/themeSwitch/themeSwitch.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Logo from '../logo/logo.svelte';
	import DisplayList from '../displayList/displayList.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { getWeek, getYear } from 'date-fns';
	import Badge from '../ui/badge/badge.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import Calendar from '../calendar/calendar.svelte';
	const getVotes = async () => {
		const res = await fetch(`/api/votestats`);
		return await res.json();
	};
	const query = createQuery({
		queryKey: ['votestats'],
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
			<Button variant="secondary" size={'sm'} class="ml-5">How to vote</Button>
		</a>
	</div>

	<div class="flex gap-10 font-mono text-xs">
		<span>
			Votes this Weeks <Badge variant="secondary"
				>{$query.data ? $query.data.votesThisPeriod : 0}</Badge
			>
		</span>
		<span>
			Votes today <Badge variant="secondary">{$query.data ? $query.data.votesToday : 0}</Badge>
		</span>
	</div>
	<div>
		<Popover.Root>
			<Popover.Trigger class={buttonVariants({ variant: 'secondary', size: 'sm' })}
				><CalendarIcon /></Popover.Trigger
			>
			<Popover.Content
				class=" m-0 flex !w-fit flex-col  items-center justify-center border-none p-0"
			>
				<!-- <Calendar type="single" bind:value class="rounded-md border" /> -->

				<Calendar />
			</Popover.Content>
		</Popover.Root>
		<DisplayList />
		<ThemeSwitch />
	</div>
</div>
