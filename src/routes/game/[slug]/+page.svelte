<script lang="ts">
	import Price from '$lib/components/priceCalc/price.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { Game, Moment } from '$lib/server/db/types';
	import { createQuery } from '@tanstack/svelte-query';
	import { scaleUtc } from 'd3-scale';
	import { AreaChart } from 'layerchart';
	import { curveBasis } from 'd3-shape';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import {
		formatDistance,
		formatDuration,
		formatISO,
		formatISO9075,
		intervalToDuration
	} from 'date-fns';
	import { wsVotes } from '$lib/shared.svelte';
	import { fade, fly } from 'svelte/transition';
	import VoteStats from '@/components/voteStats/voteStats.svelte';
	import { TZDate } from '@date-fns/tz';
	import { env } from '$env/dynamic/public';
	import Steamicon from '@/components/icons/steamicon.svelte';
	import PlayIcon from '@lucide/svelte/icons/play';
	import StarIcon from '@lucide/svelte/icons/star';

	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Button from '@/components/ui/button/button.svelte';
	import Number from '@/components/number/number.svelte';
	import { formatDurationCompact } from '@/utils';

	let {
		data
	}: {
		data: {
			gameData: Game & {
				screenshots: any;
				movies: any;
				voteCount: number;
				moments: (Moment & { stream: { publishedAt: Date } })[];
			};
		};
	} = $props();

	let selectedItem = $state<any>(null);

	const votes = createQuery(() => ({
		queryKey: [`lastvotes${data.gameData.id}`],
		queryFn: async () =>
			await fetch(`/api/lastvotes?game=${data.gameData.id}`).then((r) => r.json())
	}));

	const gameVotes = createQuery(() => ({
		queryKey: [`votestats${data.gameData.id}`],
		queryFn: async () =>
			await fetch(`/api/votestats?game=${data.gameData.id}`).then((r) => r.json())
	}));

	const graph = createQuery(() => ({
		queryKey: ['graph'],
		queryFn: async () => await fetch(`/api/graph?game=${data.gameData.id}`).then((r) => r.json())
	}));

	const allVotes = $derived(
		votes.data &&
			[...(votes.data.votes || []), ...($wsVotes || [])]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.filter(
					(v, i, arr) => arr.findIndex((x) => x.fromId === v.fromId && x.forId === v.forId) === i
				)
				.slice(0, 10)
	);

	const chartConfig = {
		votesLast7Days: { label: 'This Week', color: '#462764' },
		votesLastWeek: { label: 'Last Week', color: '#084d26' }
	} satisfies Chart.ChartConfig;
</script>

<svelte:head>
	<title
		>{`${data.gameData.name ? data.gameData.name : 'n/a'} @ ${gameVotes.data ? gameVotes.data.votesThisPeriod : 'n/a'} votes this week`}</title
	>
	<meta
		name="description"
		content="A website to track lirik's sub sunday votes. With game info, direct link to steam and more."
	/>
</svelte:head>

<div class="mx-auto max-w-screen-xl space-y-5 p-5 pt-16">
	<div class="flex flex-wrap justify-center gap-0 md:gap-5 lg:flex-nowrap">
		<div class="w-full space-y-5 md:min-w-125">
			<Card class="p-5">
				<div class="space-y-5">
					<div class=" flex items-center justify-between gap-5">
						<h1 class="truncate text-2xl font-bold">{data.gameData.name}</h1>
						<div class=" text-right">
							<div class="gap-2 text-sm">
								<b><Number number={data.gameData.recommendations} /> </b> reviews
							</div>
						</div>
					</div>
					<div class="flex flex-wrap gap-5 lg:flex-nowrap">
						{#if data.gameData.picture !== 'default'}
							<img
								alt={`Cover image for ${data.gameData.name}`}
								src={data.gameData.picture}
								class="max-w-[250px] rounded-2xl object-cover"
							/>
						{/if}
						<div class="w-full space-y-2">
							{#if data.gameData.description.length > 0}
								<p class=" leading-relaxedPast sub sunday streams mb-5">
									{data.gameData.description}
								</p>
							{/if}
							<div class=" flex w-full flex-wrap items-center gap-1">
								{#each data.gameData.categories as any as category}
									<Badge>{category.description}</Badge>
								{/each}
								<Badge variant="secondary">
									<Price price={(data.gameData.price as any).final} />
								</Badge>
								{#if data.gameData.steamId > 0}
									<a
										href={`https://store.steampowered.com/app/${data.gameData.steamId}`}
										target="_blank"
									>
										<Steamicon size={20} />
									</a>
								{/if}
							</div>
						</div>
					</div>
				</div>
				<div class="overflow-cli mx-auto py-10">
					{#if selectedItem === null}
						{#if (data.gameData.screenshots as any).length > 0}
							<img
								class="rounded-2xl p-2"
								src={(data.gameData.screenshots as any)[0].path_thumbnail}
								alt=""
							/>
						{/if}
					{:else if selectedItem && !selectedItem.mp4}
						<img class="rounded-2xl p-2" src={selectedItem.path_thumbnail} alt="" />
					{:else if selectedItem && selectedItem.mp4}
						<video
							class="rounded-2xl p-2"
							volume={0.1}
							controls
							src={selectedItem
								? selectedItem.mp4.max
								: (data.gameData.screenshots as any)[0].path_thumbnail}
						>
							<track kind="captions" />
						</video>
					{/if}
				</div>
				{#if data.gameData.screenshots.length + data.gameData.movies.length > 0}
					<div class="mx-15 pb-10">
						<Carousel.Root
							opts={{
								align: 'start'
							}}
							class=" w-full"
						>
							<Carousel.Content class="-ml-1 w-full">
								{#each data.gameData.screenshots as screenshot}
									<Carousel.Item
										onclick={() => (selectedItem = screenshot as any)}
										class=" basis-1/3 pl-1 transition-all hover:brightness-125 sm:basis-1/3 md:basis-1/3 lg:basis-1/4"
									>
										<Card class="m-0 w-fit overflow-clip p-0">
											<img class="w-50" alt="screenshot" src={screenshot.path_thumbnail} />
										</Card>
									</Carousel.Item>
								{/each}
								{#each data.gameData.movies as movie}
									<Carousel.Item class="basis-1/3 pl-1 md:basis-1/2 lg:basis-1/4">
										<Card
											class="relative m-0 flex h-full items-center justify-center overflow-clip p-0 "
										>
											<Button
												onclick={() => (selectedItem = movie as any)}
												variant="secondary"
												class="z-1  "
											>
												<PlayIcon />
											</Button>
											<img
												alt="movie thumbnail"
												class="absolute top-0 left-0 z-0"
												src={movie.thumbnail}
											/>
										</Card>
									</Carousel.Item>
								{/each}
							</Carousel.Content>
							<Carousel.Previous />
							<Carousel.Next />
						</Carousel.Root>
					</div>
				{/if}
			</Card>
			<div class="mt-5">
				{#if data.gameData.detailedDescription && (data.gameData.detailedDescription as any).html}
					<Card class="detailContent m-3 grow p-5 lg:m-0 ">
						{@html (data.gameData.detailedDescription as any).html}
					</Card>
				{/if}
			</div>
		</div>
		<div class="m-3 w-full space-y-5 md:min-w-80 lg:m-0 lg:w-4/12">
			{#if data.gameData.moments.length > 0}
				<Card class="p-3">
					{#each data.gameData.moments as moment}
						{@const dur = formatDurationCompact(moment.durationMilliseconds / 1000)}
						{@const pos = formatDurationCompact(moment.positionMilliseconds / 1000)}

						<div class=" text-sm">
							played for
							{formatDuration(
								intervalToDuration({
									start: 0,
									end: moment.durationMilliseconds
								}),
								{ format: ['hours', 'minutes'] }
							)}

							<a
								class="text-sky-500"
								href={`https://www.twitch.tv/videos/${moment.streamId}?t=${pos.replaceAll(' ', '')}`}
							>
								{formatDistance(moment.stream.publishedAt, new Date(), { addSuffix: true })}
							</a>
						</div>
					{/each}
				</Card>
			{/if}
			<Card class="p-5">
				<h3 class="text-lg">
					<b><Number number={data.gameData.voteCount} /> </b> total votes
				</h3>
				<VoteStats gameVotes={gameVotes.data} class="text-sm!" />
				{#if graph.data}
					<Chart.Container config={chartConfig}>
						<AreaChart
							data={graph.data.votes.map((e: { date: Date }) => {
								return {
									...e,
									date: new Date(e.date)
								};
							})}
							x="date"
							xScale={scaleUtc()}
							series={[
								{
									key: 'votesLast7Days',
									label: 'This Week',
									color: chartConfig.votesLast7Days.color
								},
								{
									key: 'votesLastWeek',
									label: 'Last Week',
									color: chartConfig.votesLastWeek.color
								}
							]}
							seriesLayout="stack"
							props={{
								highlight: {
									points: {
										display: 'none'
									}
								},
								area: {
									curve: curveBasis,
									'fill-opacity': 0.4,
									line: { class: 'stroke-1' }
								},
								xAxis: {
									format: (v) => {
										return v.toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric'
										});
									}
								},
								yAxis: { format: () => '' }
							}}
						>
							{#snippet tooltip()}
								<Chart.Tooltip
									labelFormatter={(v: Date) => {
										return v.toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric'
										});
									}}
									indicator="line"
								/>
							{/snippet}
						</AreaChart>
					</Chart.Container>
				{/if}
			</Card>
			<Card class=" flex gap-6 p-5 py-6 text-sm md:min-w-80">
				{#if allVotes}
					{#each allVotes as vote (vote.id)}
						<p in:fly out:fade>
							<Badge variant="secondary" href={`/user/${vote.user.id}`} class="mr-2 "
								>{vote.user.name}</Badge
							> voted {formatDistance(vote.createdAt, new TZDate(new Date(), env.PUBLIC_TZ), {
								addSuffix: true
							})}
						</p>
					{/each}
				{/if}
			</Card>
		</div>
	</div>
</div>

<style>
</style>
