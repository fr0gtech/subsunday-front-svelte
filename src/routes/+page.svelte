<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import Logo from '$lib/components/logo/logo.svelte';
	import Nav from '$lib/components/nav/nav.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Price from '$lib/components/priceCalc/price.svelte';
	import { layout, selectedPeriod, votestats, wsVotes } from '$lib/shared.svelte';
	import type { Game, GameCategories, GamePrice } from '$lib/server/db/types';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import { fade } from 'svelte/transition';
	import NumberFlow from '@number-flow/svelte';
	import { getDateRange, getNowTZ, setURLparams } from '@/utils';
	import { page } from '$app/state';
	import { formatDistance, getWeek, getYear, isAfter, isSunday, subDays } from 'date-fns';
	import VoteStats from '@/components/voteStats/voteStats.svelte';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import Button, { buttonVariants } from '@/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import LeftArrow from '@lucide/svelte/icons/step-back';
	import CustomCalendar from '$lib/components/customcalendar/customcalendar.svelte';
	import RightArrow from '@lucide/svelte/icons/step-forward';
	import { Skeleton } from '@/components/ui/skeleton/index.js';




	let periodKey = $state(0);
	let pageNumber = -1;
	const { data } = $props();
	let container = $state<HTMLDivElement | null>(null);
	let hasMore = $state(true);
	const loaderState = $state(new LoaderState());
	let allGames: (Game & { voteCount: string })[] = $state([]);
	let allGamesWithWsVotes: (Game & { voteCount: string })[] = $state([]);

	$effect(() => {
		allGamesWithWsVotes = allGames
			.map((game) => {
				const additionalVotes = $wsVotes.filter(
					(e: any) => parseInt(e.game.id) === parseInt(game.id as any)
				).length;
				return {
					...game,
					voteCount: (parseInt(game.voteCount) + additionalVotes).toString()
				};
			})
			.sort((a, b) => parseInt(b.voteCount) - parseInt(a.voteCount) || a.id - b.id);
	});

	const loadMore = async () => {
		if (!hasMore) {
			loaderState.complete();
			return;
		}
		pageNumber++;
		const response = await fetch(`/api/games?page=${pageNumber}&period=${$selectedPeriod.currentPeriod.startDate.toISOString()}`);
		let data = await response.json();
		hasMore = data.hasMore;
		allGames = [...allGames, ...data.games].sort((a, b) => b.voteCount - a.voteCount || a.id - b.id);

		if (!hasMore) {
			loaderState.complete();
			return;
		}
		await tick();
		loaderState.loaded();
	};

	async function fetchUntilFilled() {		
		while (hasMore && !checkOverflow()) {
			await loadMore();
			await tick();
		}
	}

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

    function checkOverflow() {
        return container ? container?.offsetHeight >= window.innerHeight : false;
    }

	async function fetchNewPeriod() {
		if ($selectedPeriod) {
			loaderState.reset();
			allGames = [];
			hasMore = true;
			await tick();
			await new Promise((resolve) => setTimeout(resolve, 50));
			await fetchUntilFilled();
		}
	}
	async function onPeriodChange() {
		pageNumber = -1;
		await setURLparams(page, $selectedPeriod);
		await fetchNewPeriod();
	}

	$effect(() => {
		const test = async () => {
			await onPeriodChange();
		};
		if ($selectedPeriod) {
			test();
		}
	});
	onMount(async () => {
		await fetchUntilFilled();
	});
</script>

<svelte:head>
	<title>Sub-sunday.com - Tracking votes for lirik's sub sunday.</title>
	<meta
		name="description"
		content="A website to track lirik's sub sunday votes. With game info, direct link to steam and more."
	/>
</svelte:head>
<div class=" flex max-h-screen flex-col overflow-hidden">
	{#if $layout.type === 'icon'}
		<div class=" w-full overflow-y-scroll p-5 pt-15" bind:this={container}>
			<div class="mx-auto mb-10 flex flex-col gap-5 pt-10 lg:hidden">
				<div class=" w-full text-center text-xl font-bold">
					{#if $selectedPeriod && isAfter(getNowTZ(), $selectedPeriod.currentPeriod.endDate)}
						voting ended {formatDistance($selectedPeriod.currentPeriod.endDate, getNowTZ())} ago
					{:else if $selectedPeriod && isAfter($selectedPeriod.currentPeriod.endDate, getNowTZ())}
						voting ends in {formatDistance(getNowTZ(), $selectedPeriod.currentPeriod.endDate)}
					{/if}
				</div>
				<VoteStats gameVotes={$votestats} />
				<div class="flex items-center justify-center gap-5">
					<div>
						<span class="text-sm">
							<NumberFlow
								value={$selectedPeriod ? getWeek($selectedPeriod.currentPeriod.startDate) : 0}
							/> -
							{$selectedPeriod ? getYear($selectedPeriod.currentPeriod.startDate) : 0}
						</span>
					</div>
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
							<Button size={'sm'} onclick={periodNext} variant="secondary"><RightArrow /></Button>
						</ButtonGroup.Root>
					</div>
				</div>
			</div>
			{#key periodKey}
				<InfiniteLoader
					intersectionOptions={{ rootMargin: '200px', root: container }}
					loopTimeout={500}
					loopDetectionTimeout={1000}
					loopMaxCalls={200}
					{loaderState}
					triggerLoad={loadMore}
				>
					{#each allGamesWithWsVotes as game, i (game.id)}
						<a href={`game/${game.id}`} in:fade class="z-0">
							<Card class="grid-item relative h-full max-w-[400px] border-0 !py-0">
								<div
									class="rounded-large relative !max-w-full rounded-xl shadow-none shadow-black/5"
									style="max-width: fit-content;"
								>
									{#if game.picture !== 'default'}
										<img
											class="transition-transform-opacity rounded-large border-success relative z-10 w-full !max-w-full rounded-xl border-0 opacity-0 shadow-none shadow-black/5 !duration-300 data-[loaded=true]:opacity-100 motion-reduce:transition-none"
											alt="Backseat Drivers"
											style="max-width: 100%;"
											src={game.picture}
											data-loaded="true"
										/><img
											class="rounded-large absolute inset-0 z-0 h-full w-full translate-y-1 object-cover opacity-30 blur-lg saturate-150 filter"
											alt="Backseat Drivers"
											style="max-width: 100%;"
											aria-hidden="true"
											src={game.picture}
											data-loaded="true"
										/>
									{:else}
										<div class="flex h-[150px] w-full flex-col items-center justify-center">
											<Logo />
											<p class="text-center text-xs">no image</p>
										</div>
									{/if}
								</div>
								<div class="absolute top-0 left-0 h-full w-full">
									<Badge
										class=" absolute -top-[0px] -left-[0px] z-10 flex rounded-tl-md  rounded-tr-none rounded-bl-none "
										variant="secondary"
									>
										<span class="text-base font-bold">
											<span class="text-sm font-normal">#</span><span class="mr-1 text-xl"
												>{i + 1}</span
											>{game.name.slice(0, 25)}
										</span>
									</Badge>
									<Badge
										class="absolute -top-[0px] -right-[0px] z-10 flex rounded-tl-none rounded-tr-md rounded-br-none text-sm font-normal "
										variant="secondary"
									>
										<Price price={(game.price as GamePrice).final} />
									</Badge>
									<Badge
										class="absolute -right-[0px] -bottom-[0px] z-50 flex rounded-tl-md rounded-tr-none rounded-bl-none   text-sm  "
										variant="secondary"
									>
										<NumberFlow
											value={parseInt(game.voteCount) +
												$wsVotes.filter(
													(e: any) => parseInt(e.game.id) === parseInt(game.id as any)
												).length}
										/> votes
									</Badge>
									<div class="absolute bottom-1 left-1 z-20 flex gap-1 opacity-90">
										{#if (game.categories as any).length > 0}
											{#each (game.categories as any).slice(0, 3) as GameCategories[] as category}
												<Badge variant="secondary">
													{category.description}
												</Badge>
											{/each}
										{/if}
									</div>
								</div>
							</Card>
						</a>
					{/each}
					
					{#snippet loading()}
						{#each Array(20).fill(0) as skeleton }
							<Skeleton class="w-full h-40 max-w-[400px] border-0 !py-0" />
						{/each}
					{/snippet}
					{#snippet noData()}{/snippet}
					{#snippet error(load)}
						<div>Error fetching data</div>
						<button onclick={load}>Retry</button>
					{/snippet}
				</InfiniteLoader>
			{/key}
		</div>
	{:else}
		<div class=" flex w-full flex-col items-start gap-2 overflow-y-scroll pt-12">
			{#each allGames as game, i}
				<a href={`game/${game.id}`} class="w-full px-3">
					<Card class="relative flex w-full flex-row items-start gap-0 overflow-clip !py-0">
						<div class=" h-[40px] w-[100px]">
							{#if game.picture !== 'default'}
								<div class="relative w-full">
									<img
										class="absolute top-0 object-cover"
										alt={`${game.name} image`}
										src={game.picture}
									/>
								</div>
							{:else}
								<div class="flex h-full w-full flex-col items-center justify-center">
									<Logo />
									<p class="text-center text-xs">no image</p>
								</div>
							{/if}
						</div>
						<div>
							<Badge
								class="bg-primary-foreground text-primary-background z-10  text-xl"
								variant="default"
							>
								# {i + 1}
								{game.name}
							</Badge>
							<Badge class="bg-primary-foreground text-primary-background  z-10 " variant="default">
								<Price price={(game.price as GamePrice).final} />
							</Badge>
							<Badge class="bg-primary-foreground text-primary-background z-10 " variant="default">
								votes: {game.voteCount}
							</Badge>
							<div class="z-20 flex gap-1 opacity-90">
								{#each game.categories as GameCategories[] as category}
									<Badge variant="default" class="bg-primary-foreground text-primary-background ">
										{category.description}
									</Badge>
								{/each}
							</div>
						</div>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>
