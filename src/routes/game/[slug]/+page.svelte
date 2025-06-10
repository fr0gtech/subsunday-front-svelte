<script lang="ts">
	import Price from '$lib/components/priceCalc/price.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { Game } from '$lib/server/db/types';
	import { createQuery } from '@tanstack/svelte-query';
	import { scaleUtc } from 'd3-scale';
	import { AreaChart } from 'layerchart';
	import { curveBasis } from 'd3-shape';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import { formatDistance, formatRelative } from 'date-fns';
	import { wsVotes } from '$lib/shared.svelte';
	import { fade, fly } from 'svelte/transition';
	import VoteStats from '@/components/voteStats/voteStats.svelte';
	import { TZDate } from '@date-fns/tz';
	import { env } from '$env/dynamic/public';
	import Steamicon from '@/components/icons/steamicon.svelte';

	let { data }: { data: { gameData: Game } } = $props();

	const getVotes = async () => {
		const res = await fetch(`/api/lastvotes?game=${data.gameData.id}`);
		return await res.json();
	};
	const votes = createQuery({
		queryKey: [`lastvotes${data.gameData.id}`],
		queryFn: () => getVotes()
	});
	const getVoteStats = async () => {
		const res = await fetch(`/api/votestats?game=${data.gameData.id}`);
		return await res.json();
	};

	const gameVotes = createQuery({
		queryKey: [`votestats${data.gameData.id}`],
		queryFn: () => getVoteStats()
	});

	const getGraph = async () => {
		const res = await fetch(`/api/graph?game=${data.gameData.id}`);
		return await res.json();
	};

	const graph = createQuery({
		queryKey: ['graph'],
		queryFn: () => getGraph()
	});

	const allVotes = $derived(
		$votes.data &&
			[
				...($votes.data.votes || []),
				...$wsVotes.filter((e) => parseInt(e.game.id) === parseInt(data.gameData.id as string))
			]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 10)
	);

	const chartConfig = {
		votesLast7Days: { label: 'This Week', color: 'var(--chart-1)' },
		votesLastWeek: { label: 'Last Week', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
</script>

<!-- <svelte:head>
	{#if $page.data.meta}
		{#each $page.data.meta as { name, content }}
			<meta {name} {content} />
		{/each}
	{/if}
</svelte:head> -->

<div class="mx-auto max-w-screen-xl space-y-5 pt-16">
	<div class="flex justify-center gap-5">
		<div class="w-8/12 space-y-5">
			<Card class="pt-3">
				<div class="space-y-2 px-4">
					<div class=" flex items-center gap-2">
						<h1 class="text-xl font-bold">{data.gameData.name}</h1>
						<div class="text-xs">reviews: {data.gameData.recommendations}</div>
					</div>
					<div class="flex gap-5">
						{#if data.gameData.picture !== 'default'}
							<img
								alt={`Cover image for ${data.gameData.name}`}
								src={data.gameData.picture}
								class="max-w-[250px] rounded-2xl object-cover"
							/>
						{/if}
						<div class="space-y-2">
							<p class="">
								{data.gameData.description}
							</p>
							<div class="flex items-center gap-1">
								{#each data.gameData.categories as any as category}
									<Badge variant="secondary">{category.description}</Badge>
								{/each}
								<Badge>
									<Price price={(data.gameData.price as any).final} />
								</Badge>
								<a
									href={`https://store.steampowered.com/app/${data.gameData.steamId}`}
									target="_blank"
								>
									<Steamicon size={20} />
								</a>
							</div>
						</div>
					</div>
				</div>
			</Card>
			<div class="flex gap-5">
				{#if data.gameData.detailedDescription && (data.gameData.detailedDescription as any).html}
					<Card class="detailContent grow px-4">
						{@html (data.gameData.detailedDescription as any).html}
					</Card>
				{/if}
			</div>
		</div>
		<div class="w-4/12 space-y-5">
			<Card class="p-5">
				<VoteStats gameVotes={$gameVotes.data} />
				<!-- <div class="flex flex-row justify-center gap-5 font-mono text-xs">
					<span>
						Votes this week: <Badge variant="secondary"
							>{$gameVotes.data ? $gameVotes.data.votesThisPeriod : 0}</Badge
						>
					</span>
					<span>
						Votes today <Badge variant="secondary"
							>{$gameVotes.data ? $gameVotes.data.votesToday : 0}</Badge
						>
					</span>
				</div> -->
				{#if $graph.data}
					<Chart.Container config={chartConfig}>
						<AreaChart
							data={$graph.data.votes.map((e: { date: Date }) => {
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
			<Card class=" flex gap-7 p-3 text-xs">
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
