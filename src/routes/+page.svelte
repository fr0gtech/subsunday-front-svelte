<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import Logo from '$lib/components/logo/logo.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Price from '$lib/components/priceCalc/price.svelte';
	import { layout, selectedPeriod, votestats, wsVotes } from '$lib/shared.svelte';
	import type { Game, GameCategories, GamePrice, Moment } from '$lib/server/db/types';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import { fade } from 'svelte/transition';
	import NumberFlow from '@number-flow/svelte';
	import { getDateRange, getNowTZ, setURLparams } from '@/utils';
	import { page } from '$app/state';
	import {
		formatDistance,
		formatDuration,
		getWeek,
		getYear,
		intervalToDuration,
		isAfter,
		subDays
	} from 'date-fns';
	import VoteStats from '@/components/voteStats/voteStats.svelte';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import Button, { buttonVariants } from '@/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import LeftArrow from '@lucide/svelte/icons/step-back';
	import CustomCalendar from '$lib/components/customcalendar/customcalendar.svelte';
	import RightArrow from '@lucide/svelte/icons/step-forward';
	import CheckIcon from '@lucide/svelte/icons/check';

	import { createQuery } from '@tanstack/svelte-query';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { toast } from 'svelte-sonner';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import ToastComp from '$lib/components/ToastComp.svelte';

	let periodKey = $state(0);
	let pageNumber = -1;
	let container = $state<HTMLDivElement | null>(null);
	let hasMore = $state(true);
	const loaderState = $state(new LoaderState());
	let allGames: (Game & { voteCount: string })[] = $state([]);
	let allGamesWithWsVotes: (Game & { voteCount: string })[] = $state([]);

	$effect(() => {
		allGamesWithWsVotes = allGames
			.map((game) => {
				return {
					...game,
					voteCount: (
						parseInt(game.voteCount) +
						// i also need to filter out older votes for each user atm?
						// this kinda sucks when period changes but that can be a bug for now
						// so best would be to make wsVotes a set of votes with key of userId?
						// otherwise ppl that update vote fast can spam up a number even tho its just visual we should fix it
						$wsVotes.filter((e: any) => parseInt(e.forId) === parseInt(game.id as any)).length
					).toString()
				};
			})
			.sort((a, b) => parseInt(b.voteCount) - parseInt(a.voteCount) || a.id - b.id);
	});

	const matchingStream = createQuery(() => ({
		queryKey: ['matchingStream', $selectedPeriod.currentPeriod.startDate],
		queryFn: async () =>
			await fetch(
				`/api/matchingstream?p=${$selectedPeriod.currentPeriod.startDate.getTime()}`
			).then((r) => r.json())
	}));

	const loadMore = async () => {
		if (!hasMore) {
			loaderState.complete();
			return;
		}
		pageNumber++;
		const response = await fetch(
			`/api/games?page=${pageNumber}&period=${$selectedPeriod.currentPeriod.startDate.toISOString()}`
		);
		let data = await response.json();
		hasMore = data.hasMore;
		allGames = [...allGames, ...data.games].sort(
			(a, b) => b.voteCount - a.voteCount || a.id - b.id
		);

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
	<title
		>{`${getWeek($selectedPeriod.currentPeriod.startDate)}-${getYear($selectedPeriod.currentPeriod.startDate)} @ ${$votestats.votesThisPeriod} votes`}</title
	>
	<meta
		name="description"
		content="A website to track lirik's sub sunday votes. With game info, direct link to steam and more."
	/>
</svelte:head>
{#snippet mobileStats()}
	<div class="mt-20 mb-10 w-full space-y-5 lg:hidden">
		<div class="mx-auto flex w-fit items-center gap-5">
			<span class="text-sm">
				<NumberFlow
					value={$selectedPeriod ? getWeek($selectedPeriod.currentPeriod.startDate) : 0}
				/> -
				{$selectedPeriod ? getYear($selectedPeriod.currentPeriod.startDate) : 0}
			</span>
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

		<div class=" w-full text-center text-lg">
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
		</div>
		<div class="flex justify-center">
			<VoteStats gameVotes={$votestats} class={'text-sm'} />
		</div>
	</div>
{/snippet}
<div class=" flex max-h-screen flex-col overflow-hidden">
	{#if true}
		<div class="mt-20 h-full p-20 text-center text-2xl">under maintenance, brb</div>
	{:else if $layout.type === 'icon'}
		<div class=" w-full space-y-5 overflow-y-scroll px-4 lg:pt-20" bind:this={container}>
			{@render mobileStats()}
			<!-- {#if (allGamesWithWsVotes.length === 0 || loaderState.status === 'LOADING') && loaderState.status !== 'COMPLETE'}
				<div class="infinite-loader-wrapper">
					{#each Array(20).fill(0) as skeleton}
						<Skeleton class="grid-item h-40 w-full max-w-[400px] border-0 !py-0" />
					{/each}
				</div>
			{/if} -->
			<!-- {JSON.stringify(matchingStream.data.stream.moments)} -->

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
						{@const foundMoment =
							matchingStream.data &&
							matchingStream.data.stream &&
							matchingStream.data.stream.moments &&
							matchingStream.data.stream.moments.find(
								(moment: Moment) => moment.description === game.name
							)}

						<!-- <a href={`game/${game.id}`} in:fade class=" z-0 mx-auto w-full min-w-80"> -->
						<Card class="grid-item relative mx-auto h-38 w-full max-w-[400px] border-0 !py-0">
							<div class=" pointer-events-none absolute top-0 left-0 z-10 h-full w-full">
								<Tooltip.Root>
									<Tooltip.Trigger class="ml-2">
										<Badge
											class={' pointer-events-auto absolute -top-[0px] -left-[0px] z-10 flex cursor-pointer!  rounded-tl-md rounded-tr-none rounded-bl-none'}
											variant="secondary"
										>
											<button
												onclick={async () => {
													toast.success(ToastComp, {
														componentProps: {
															message: `copied <b>!vote ${game.name}<b/> to clipboard`
														}
													});
													await navigator.clipboard.writeText(`!vote ${game.name}`);
												}}
												class="flex cursor-pointer! items-center gap-1 p-1 text-base leading-[17px]"
											>
												<!-- <span class="text-xs font-normal">#</span> -->
												<div class="border-r-1 pr-2 text-xs">
													{i + 1}
												</div>
												<div class="select-text">
													{game.name.slice(0, 25)}
												</div>
											</button>
										</Badge>
									</Tooltip.Trigger>
									<Tooltip.Content class="bg-background! text-foreground! tooltipNoArrow -mt-5!">
										<p>
											Click to copy <span class="font-mono! text-sky-500"
												>!vote <span class="">{game.name}</span></span
											>{' '}to clipboard
										</p>
									</Tooltip.Content>
								</Tooltip.Root>
								{#if (game.price as GamePrice).final}
									<Badge
										class="absolute -top-[0px] -right-[0px] z-10 flex  rounded-tl-none rounded-tr-md rounded-br-none p-1.5 text-xs font-normal"
										variant="secondary"
									>
										<Price price={(game.price as GamePrice).final} />
									</Badge>
								{/if}
								{#if foundMoment}
									<div
										class="  absolute top-0 z-[100]! flex h-full w-full cursor-help items-center justify-end"
									>
										<HoverCard.Root>
											<HoverCard.Trigger>
												<Badge
													variant="secondary"
													class="pointer-events-auto rounded-tr-none  rounded-br-none p-2"
												>
													<CheckIcon color="lime" />
												</Badge>
											</HoverCard.Trigger>
											<HoverCard.Content class="w-full">
												<div class="flex gap-2">
													{#if foundMoment.game.picture === 'default'}
														<div class="rounded-xl bg-neutral-700 p-4 text-xs">no image</div>
													{:else}
														<img
															alt={foundMoment.game.title}
															class=" h-10 rounded-xl"
															src={foundMoment.game.picture}
														/>
														<div>
															<div>{foundMoment.game.name}</div>
															<div class=" text-sm">
																played for
																{formatDuration(
																	intervalToDuration({
																		start: 0,
																		end: foundMoment.durationMilliseconds
																	}),
																	{ format: ['hours', 'minutes'] }
																)}
															</div>
														</div>
													{/if}
												</div>
											</HoverCard.Content>
										</HoverCard.Root>
									</div>
								{/if}
								<Badge
									class="absolute -right-[0px] -bottom-[0px] z-50 flex rounded-tl-md rounded-tr-none rounded-bl-none   text-sm  "
									variant="secondary"
								>
									<NumberFlow value={parseInt(game.voteCount)} /> votes
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
							{#if game.picture !== 'default'}
								<img
									class="rounded-large absolute inset-0 z-0 h-full w-full translate-y-1 opacity-20 blur-sm saturate-150 filter"
									alt={game.name}
									style="max-width: 100%;"
									aria-hidden="true"
									src={game.picture}
									data-loaded="true"
								/>
							{/if}
							<a href={`game/${game.id}`} in:fade class="  z-0! mx-auto w-full min-w-80">
								<div class="z-0! h-38 overflow-clip rounded-xl">
									{#if game.picture !== 'default'}
										<img
											class="z-0! min-h-full object-cover"
											alt={game.name}
											src={game.picture}
											data-loaded="true"
										/>
										<!-- <img
											class="transition-transform-opacity rounded-large border-success absolute z-10 mx-auto w-full !max-w-full rounded-xl border-0 object-cover opacity-0 shadow-none shadow-black/5 !duration-300 data-[loaded=true]:opacity-100 motion-reduce:transition-none"
											alt={game.name}
											style="max-width: 100%;"
											src={game.picture}
											data-loaded="true"
										/> -->
									{:else}
										<div
											class="flex h-35 w-full flex-col items-center justify-center md:min-h-auto"
										>
											<Logo />
											<p class="w-full text-center text-xs">no image</p>
										</div>
									{/if}
								</div>
							</a>
						</Card>
						<!-- </a> -->
					{/each}

					{#snippet loading()}{/snippet}
					{#snippet noData()}
						{#if allGamesWithWsVotes.length === 0}
							<div>No data for this period</div>
						{/if}
					{/snippet}
					{#snippet error(load)}
						<div>Error fetching data</div>
						<button onclick={load}>Retry</button>
					{/snippet}
				</InfiniteLoader>
			{/key}
		</div>
	{:else}
		<div class=" flex w-full flex-col items-start gap-2 overflow-y-scroll lg:pt-20">
			{@render mobileStats()}

			{#each allGames as game, i}
				<a href={`game/${game.id}`} class="w-full px-3">
					<Card class="relative flex w-full flex-row items-start gap-0 overflow-clip !py-0">
						<div class="min-h-20 w-1/3">
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
								class="bg-primary-foreground text-primary-background z-10 text-lg"
								variant="default"
							>
								<span class="text-sm"># {i + 1}</span>
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
