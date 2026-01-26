<script lang="ts">
	import ThemeSwitch from '$lib/components/themeSwitch/themeSwitch.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Logo from '../logo/logo.svelte';
	import DisplayList from '../displayList/displayList.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SettingsIcon from '@lucide/svelte/icons/settings-2';
	import LeftArrow from '@lucide/svelte/icons/step-back';
	import RightArrow from '@lucide/svelte/icons/step-forward';
	import NumberFlow from '@number-flow/svelte';
	import { page } from '$app/state';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { createQuery } from '@tanstack/svelte-query';
	import CustomCalendar from '../customcalendar/customcalendar.svelte';
	import { selectedPeriod, votestats } from '@/shared.svelte';
	import VoteStats from '../voteStats/voteStats.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import { cn, dateFromYearWeek, getDateRange, getNowTZ, setURLparams } from '@/utils';
	import Badge from '../ui/badge/badge.svelte';

	import { formatDistance, getWeek, getYear, isAfter, isSunday, subDays } from 'date-fns';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onMount } from 'svelte';
	let isOpen = $state(false);
	let search = $state('');

	const query = createQuery(() => ({
		queryKey: ['votestats', $selectedPeriod],
		queryFn: async () =>
			await fetch(
				`/api/votestats?period=${$selectedPeriod.currentPeriod.startDate.toISOString()}`
			).then((r) => r.json())
	}));

	$effect(() => {
		if (query.data) votestats.set(query.data);
	});

	async function periodNext() {
		$selectedPeriod = getDateRange({
			offset: $selectedPeriod.currentPeriod.nextStartDate
		});
		await setURLparams(page, $selectedPeriod);
	}
	async function periodPrev() {
		$selectedPeriod = getDateRange({
			offset: subDays($selectedPeriod.currentPeriod.startDate, 1)
		});
		await setURLparams(page, $selectedPeriod);
	}

	const links: { title: string; href: string; description: string; warning?: boolean }[] = [
		{
			title: 'How to vote',
			href: '/how-to-vote',
			description: 'Learn how to participate in the voting process.'
		},
		{
			title: 'Leaderboard',
			href: '/leaderboard',
			description: 'Check out the top voted games and users.'
		},
		{
			title: 'Played Games',
			href: '/played',
			description: 'Find out what games lirik already played on subsunday'
		},
		{
			title: 'About',
			href: '/about',
			description: 'Learn more about Sub Sunday and its mission.',
			warning: true
		}
	];

	type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
		title: string;
		href: string;
		content: string;
		warning?: boolean;
	};
	onMount(async () => {
		if (page.url.searchParams.get('y') && page.url.searchParams.get('w')) {
			$selectedPeriod = getDateRange({
				offset: dateFromYearWeek(
					parseInt(page.url.searchParams.get('y') || '0'),
					parseInt(page.url.searchParams.get('w') || '0')
				)
			});
		} else {
			if (isSunday(getNowTZ())) {
				$selectedPeriod = getDateRange({ offset: subDays(getNowTZ(), 1) });
			} else {
				$selectedPeriod = getDateRange({ offset: getNowTZ() });
			}
		}
		await setURLparams(page, $selectedPeriod);
	});
</script>

{#snippet ListItem({
	title,
	content,
	href,
	class: className,
	warning,
	...restProps
}: ListItemProps)}
	<a
		onclick={() => {
			isOpen = false;
		}}
		{href}
		class={cn(
			page.url.pathname === href && 'bg-sky-500/50!',
			' hover:text-accent-foreground focus:text-accent-foreground relative block space-y-1 rounded-md bg-neutral-500/10 px-3 py-2 select-none hover:bg-neutral-500/20',
			className,
			warning
				? 'after:absolute after:top-0 after:right-1 after:ml-1 after:text-red-400 after:content-["*"]'
				: ''
		)}
		{...restProps as any}
	>
		<h1 class=" text-base leading-none">{title}</h1>
	</a>
{/snippet}
<div class="bg-background fixed z-50 flex w-full items-center justify-between p-2">
	<div class="w-1/3 md:w-1/4">
		<div class="relative flex w-full items-center xl:w-1/2">
			<Popover.Root bind:open={isOpen}>
				<Popover.Trigger class={'show relative mr-2 ml-2'}>
					<div
						class="cursor-pointer after:absolute after:-top-2 after:-right-1 after:ml-1 after:text-red-400 after:content-['*']"
					>
						<MenuIcon size={18} />
					</div>
				</Popover.Trigger>
				<Popover.Content
					class=" m-0 ml-2 flex  w-[calc(100vw-5%)] min-w-80 flex-col gap-2 border-none p-5 sm:w-full"
				>
					{#each links as link, i (i)}
						{@render ListItem({
							href: link.href,
							title: link.title,
							content: link.description,
							warning: link.warning
						})}
					{/each}
					<InputGroup.Root
						onkeydown={(e) =>
							e.key === 'Enter' && goto(`/search?q=${search}`, { replaceState: true })}
						class="hidden h-8 min-w-[200px] border-0 outline-0 lg:flex"
					>
						<InputGroup.Input bind:value={search} name="search" placeholder="Search..." />
						<InputGroup.Addon>
							<SearchIcon />
						</InputGroup.Addon>
					</InputGroup.Root>
					<DisplayList />
					<ThemeSwitch />
				</Popover.Content>
			</Popover.Root>
			<div class="flex items-center gap-2">
				<a href="/" class="mr-2 ml-3 flex items-center gap-3">
					<Logo />
					<h1 class="text-lg font-bold whitespace-nowrap">Sub Sunday</h1>
				</a>
				<div class="hidden gap-2 whitespace-nowrap">
					{#each links as link, i (i)}
						{@render ListItem({
							href: link.href,
							title: link.title,
							content: link.description,
							warning: link.warning
						})}
					{/each}
				</div>
			</div>
		</div>
	</div>
	<div class="hidden grow items-center justify-start gap-10 lg:flex">
		<div class="flex items-center gap-2">
			<span class="font-mono! text-xs! whitespace-nowrap">
				<NumberFlow
					value={$selectedPeriod ? getWeek($selectedPeriod.currentPeriod.startDate) : 0}
				/> -
				{$selectedPeriod ? getYear($selectedPeriod.currentPeriod.startDate) : 0}
			</span>

			<ButtonGroup.Root>
				<Button size={'sm'} onclick={periodPrev} variant="secondary"
					><LeftArrow class="h-3.5! w-3.5!" /></Button
				>
				<Popover.Root>
					<Popover.Trigger class={buttonVariants({ variant: 'secondary', size: 'sm' })}
						><CalendarIcon class="h-3.5! w-3.5!" /></Popover.Trigger
					>
					<Popover.Content
						class=" m-0 flex !w-fit flex-col  items-center justify-center border-none p-0"
					>
						<!-- <Calendar type="single" bind:value class="rounded-md border" /> -->

						<CustomCalendar />
					</Popover.Content>
				</Popover.Root>
				<Button
					disabled={isAfter($selectedPeriod.currentPeriod.nextStartDate, getNowTZ())}
					size={'sm'}
					onclick={periodNext}
					variant="secondary"
				>
					<RightArrow class="h-3.5! w-3.5!" />
				</Button>
			</ButtonGroup.Root>
		</div>
		<VoteStats gameVotes={query.data} class=" hidden text-sm whitespace-nowrap lg:flex" />
	</div>
	<div>
		<span class=" hidden text-sm whitespace-nowrap lg:block">
			{#if $selectedPeriod && isAfter(getNowTZ(), $selectedPeriod.currentPeriod.endDate)}
				voting for week
				<b>
					<NumberFlow
						value={$selectedPeriod ? getWeek($selectedPeriod.currentPeriod.startDate) : 0}
					/>
				</b>
				({$selectedPeriod ? getYear($selectedPeriod.currentPeriod.startDate) : 0}) ended
				<b>{formatDistance($selectedPeriod.currentPeriod.endDate, getNowTZ())}</b> ago
			{:else if $selectedPeriod && isAfter($selectedPeriod.currentPeriod.endDate, getNowTZ())}
				voting for
				<b>
					<NumberFlow
						value={$selectedPeriod ? getWeek($selectedPeriod.currentPeriod.startDate) : 0}
					/>
				</b>
				-
				{$selectedPeriod ? getYear($selectedPeriod.currentPeriod.startDate) : 0}
				ends in <b>{formatDistance(getNowTZ(), $selectedPeriod.currentPeriod.endDate)}</b>
			{/if}
		</span>
	</div>
</div>
