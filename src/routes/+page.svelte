<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import Logo from '$lib/components/logo/logo.svelte';
	import Nav from '$lib/components/nav/nav.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Price from '$lib/components/priceCalc/price.svelte';
	import { layout, selectedPeriod, wsVotes } from '$lib/shared.svelte';
	import type { Game, GameCategories, GamePrice } from '$lib/server/db/types';
	import { InfiniteLoader, LoaderState } from 'svelte-infinite';
	import { fade } from 'svelte/transition';
	import NumberFlow from '@number-flow/svelte';
	import { getNowTZ } from '@/utils';
	import { toast } from 'svelte-sonner';
	let page = -1;
	let hasMore = $state(true);
	const loaderState = new LoaderState();
	let allGames: (Game & { voteCount: number })[] = $state([]);
	const loadMore = async () => {
		if (!hasMore) {
			loaderState.complete();
			return;
		}
		page++;
		const response = await fetch(
			`/api/games?page=${page}&period=${$selectedPeriod.currentPeriod.startDate.toISOString()}`
		);
		let data = await response.json();
		hasMore = data.hasMore;
		if (!hasMore) {
			loaderState.complete();
			return;
		}
		allGames.push(...data.games);
		loaderState.loaded();
	};

	async function fetchUntilFilled() {
		while (hasMore && !isOverflowing()) {
			await loadMore();
			await tick();
		}
	}
	function isOverflowing() {
		return document.documentElement.scrollHeight > window.innerHeight;
	}
	let lastPeriodStart = $state(getNowTZ().getTime());
	const newPeriod = () => {
		if (lastPeriodStart !== $selectedPeriod.currentPeriod.startDate.getTime()) {
			allGames = [];
			page = 0;
			hasMore = true;
			loaderState.reset();
			fetchUntilFilled();
		}
		lastPeriodStart = $selectedPeriod.currentPeriod.startDate.getTime();
	};
	$effect(() => {
		if ($selectedPeriod) {
			newPeriod();
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
<div class="flex flex-col pt-12">
	{#if $layout.type === 'icon'}
		<div class="mt-5 w-full items-center justify-center">
			<div class="flex w-full px-5">
				<!-- loop things are to prevent "loop detected" from this lib -->
				<InfiniteLoader
					loopTimeout={500}
					loopDetectionTimeout={1000}
					loopMaxCalls={200}
					{loaderState}
					triggerLoad={loadMore}
				>
					{#each allGames as game, i (game.id)}
						<a href={`game/${game.id}`} in:fade class="z-0">
							<Card class="grid-item relative !py-0">
								<div
									class="rounded-large relative !max-w-full rounded-xl shadow-none shadow-black/5"
									style="max-width: fit-content;"
								>
									{#if game.picture !== 'default'}
										<!-- this just a bunch of shit to create the bg blur on the main card in icon view -->
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
								<div class="absolute top-0 left-0 h-full w-full overflow-clip rounded-xl">
									<Badge
										class=" absolute -top-[1px] -left-[1px] z-10 flex rounded-tl-xl  rounded-tr-none rounded-bl-none "
										variant="secondary"
									>
										<span class="text-base font-bold">
											<span class="mr-1 text-sm font-normal">#{i + 1}</span>{game.name.slice(0, 25)}
										</span>
									</Badge>
									<Badge
										class="absolute -top-[1px] -right-[1px] z-10 flex rounded-tl-none rounded-tr-md  rounded-br-none text-sm "
										variant="secondary"
									>
										<Price price={(game.price as GamePrice).final} />
									</Badge>
									<Badge
										class="absolute -right-[1px] -bottom-[1px] z-10 z-50 flex rounded-tl-md rounded-tr-none rounded-bl-none   text-sm  "
										variant="secondary"
									>
										<NumberFlow
											value={game.voteCount +
												$wsVotes.filter((e) => parseInt(e.game.id) === parseInt(game.id)).length}
										/> votes
									</Badge>
									<div class="absolute bottom-1 left-1 z-20 flex gap-1 opacity-90">
										{#if game.categories.length > 0}
											{#each game.categories.slice(0, 3) as GameCategories[] as category}
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
						Loading...
					{/snippet}
					{#snippet noData()}{/snippet}
					{#snippet error(load)}
						<div>Error fetching data</div>
						<button onclick={load}>Retry</button>
					{/snippet}
				</InfiniteLoader>
			</div>
		</div>
	{:else}
		<div class="mt-5 w-full items-center justify-center">
			<div class="flex w-full px-5">
				<div class="grid-container">
					{#each allGames as game, i}
						<a href={`game/${game.id}`}>
							<Card class="grid-item relative flex flex-row overflow-clip !py-0">
								<div class=" h-[50px] w-[100px]">
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
										class=" bg-primary-foreground text-primary-background  z-10"
										variant="default"
									>
										# {i + 1}
										{game.name}
									</Badge>
									<Badge
										class="bg-primary-foreground text-primary-background  z-10 "
										variant="default"
									>
										<Price price={(game.price as GamePrice).final} />
									</Badge>
									<Badge
										class="bg-primary-foreground text-primary-background z-10 "
										variant="default"
									>
										votes: {game.voteCount}
									</Badge>
									<div class="z-20 flex gap-1 opacity-90">
										{#each game.categories as GameCategories[] as category}
											<Badge
												variant="default"
												class="bg-primary-foreground text-primary-background "
											>
												{category.description}
											</Badge>
										{/each}
									</div>
								</div>
							</Card>
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.grid-item {
		display: flex;
		justify-content: center;
	}
</style>
