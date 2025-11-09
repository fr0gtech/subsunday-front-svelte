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
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import CustomCalendar from '../customcalendar/customcalendar.svelte';
	import { selectedPeriod, votestats, wsVotes } from '@/shared.svelte';
	import VoteStats from '../voteStats/voteStats.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import { cn, getDateRange, getNowTZ, setURLparams } from '@/utils';
	import Badge from '../ui/badge/badge.svelte';

	import {
		formatDate,
		formatDistance,
		getWeek,
		getYear,
		isAfter,
		isSunday,
		subDays
	} from 'date-fns';
	import type { HTMLAttributes } from 'svelte/elements';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	const queryClient = useQueryClient();
	let isOpen = $state(false);
	let search = $state('');
	const { data } = $props();

	const getVotes = async () => {
		const res = await fetch(
			`/api/votestats?period=${$selectedPeriod.currentPeriod.startDate.toISOString()}`
		);
		return await res.json();
	};
	const query = createQuery({
		queryKey: ['votestats'],
		queryFn: () => getVotes()
	});
	$effect(() => {
		votestats.set($query.data);
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
	$effect(() => {
		const test = async () => {
			if ($selectedPeriod.currentPeriod.startDate) {
				queryClient.invalidateQueries({ queryKey: ['votestats'] });
			}
		};
		test();
	});

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
		console.log(data);

		if (data.period && parseInt(data.period as string) > 0) {
			$selectedPeriod = getDateRange({ offset: new Date(parseInt(data.period as string)) });
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
	<div>
		<a
			onclick={() => {
				isOpen = false;
			}}
			{href}
			class={cn(
				'hover:bg-accent bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative block space-y-1 rounded-md p-2 select-none',
				className,
				warning
					? 'after:absolute after:top-0 after:right-0 after:ml-1 after:text-red-400 after:content-["*"]'
					: ''
			)}
			{...restProps}
		>
			<div class="text-sm leading-none font-medium">{title}</div>
		</a>
	</div>
{/snippet}
<div class="bg-currentbg fixed z-50 flex w-full items-center p-2 backdrop-blur-xl">
	<div class="flex w-2/5">
		<div class="flex w-full items-center xl:w-1/2">
			<Popover.Root bind:open={isOpen}>
				<Popover.Trigger
					class={[buttonVariants({ variant: 'secondary', size: 'sm' }), ' show mr-2 xl:hidden']}
				>
					<MenuIcon />
				</Popover.Trigger>
				<Popover.Content class=" m-0 ml-2 flex !w-fit flex-col border-none p-5">
					<!-- <Calendar type="single" bind:value class="rounded-md border" /> -->
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
						class=" h-8 min-w-[200px] border-0 outline-0 "
					>
						<InputGroup.Input bind:value={search} name="search" placeholder="Search..." />
						<InputGroup.Addon>
							<SearchIcon />
						</InputGroup.Addon>
						<!-- {#if searchData}
				<InputGroup.Addon align="inline-end"
					>{searchData.games.length + searchData.users.length} results
				</InputGroup.Addon>
			{/if} -->
					</InputGroup.Root>
				</Popover.Content>
			</Popover.Root>
			<div class="flex items-center gap-2">
				<a href="/" class="mr-2 ml-3 flex items-center gap-3">
					<Logo />
					<h1 class="text-lg font-bold whitespace-nowrap">Sub Sunday</h1>
				</a>
				<div class="hidden gap-2 whitespace-nowrap xl:flex">
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
	<div class="flex items-center justify-start gap-10">
		<VoteStats gameVotes={$query.data} class="mr-1 hidden whitespace-nowrap lg:flex" />

		<div>
			<ButtonGroup.Root>
				<Button size={'sm'} onclick={periodPrev} variant="secondary"><LeftArrow /></Button>
				<Popover.Root>
					<Popover.Trigger class={buttonVariants({ variant: 'secondary', size: 'sm' })}
						><CalendarIcon /></Popover.Trigger
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
					variant="secondary"><RightArrow /></Button
				>
			</ButtonGroup.Root>
		</div>
		<span class=" hidden text-sm lg:block">
			{#if $selectedPeriod && isAfter(getNowTZ(), $selectedPeriod.currentPeriod.endDate)}
				voting for <Badge variant="secondary" class="font-mono!">
					<NumberFlow
						value={$selectedPeriod ? getWeek($selectedPeriod.currentPeriod.startDate) : 0}
					/> -
					{$selectedPeriod ? getYear($selectedPeriod.currentPeriod.startDate) : 0}
				</Badge> ended
				{formatDistance($selectedPeriod.currentPeriod.endDate, getNowTZ())} ago
			{:else if $selectedPeriod && isAfter($selectedPeriod.currentPeriod.endDate, getNowTZ())}
				voting for <Badge variant="secondary" class="font-mono!">
					<NumberFlow
						value={$selectedPeriod ? getWeek($selectedPeriod.currentPeriod.startDate) : 0}
					/> -
					{$selectedPeriod ? getYear($selectedPeriod.currentPeriod.startDate) : 0}
				</Badge>
				ends in {formatDistance(getNowTZ(), $selectedPeriod.currentPeriod.endDate)}
			{/if}
		</span>
	</div>
	<div class="flex grow justify-end gap-2">
		<div class="hidden items-center gap-5 text-xs whitespace-nowrap lg:flex"></div>
		<Popover.Root>
			<Popover.Trigger
				class={[buttonVariants({ variant: 'secondary', size: 'sm' }), ' show mr-2 ']}
			>
				<SettingsIcon />
			</Popover.Trigger>
			<Popover.Content class=" m-0 ml-2 flex !w-fit flex-col gap-3 border-none p-5">
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
	</div>
</div>
