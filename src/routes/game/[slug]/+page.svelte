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

	let { data }: { data: Game } = $props();

	const getVotes = async () => {
		const res = await fetch(`/api/lastvotes?game=${data.id}`);
		return await res.json();
	};
	const votes = createQuery({
		queryKey: [`lastvotes${data.id}`],
		queryFn: () => getVotes()
	});
	const getVoteStats = async () => {
		const res = await fetch(`/api/votestats?game=${data.id}`);
		return await res.json();
	};

	const gameVotes = createQuery({
		queryKey: [`votestats${data.id}`],
		queryFn: () => getVoteStats()
	});

	const getGraph = async () => {
		const res = await fetch(`/api/graph?game=${data.id}`);
		return await res.json();
	};

	const graph = createQuery({
		queryKey: ['graph'],
		queryFn: () => getGraph()
	});

	const chartConfig = {
		votesLast7Days: { label: 'This Week', color: 'var(--chart-1)' },
		votesLastWeek: { label: 'Last Week', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="mx-auto max-w-screen-xl space-y-5 pt-16">
	<div class="flex gap-5">
		<div class="space-y-5">
			<Card class="pt-3">
				<div class="space-y-2 px-4">
					<div class=" flex items-center gap-2">
						<h1 class="text-xl font-bold">{data.name}</h1>
						<div class="text-xs">reviews: {data.recommendations}</div>
					</div>
					<div class="flex gap-5">
						<img
							alt={`Cover image for ${data.name}`}
							src={data.picture}
							class="max-w-[250px] rounded-2xl object-cover"
						/>
						<div class="space-y-2">
							<p class="">
								{data.description}
							</p>
							<div class="flex gap-1">
								{#each data.categories as any as category}
									<Badge>{category.description}</Badge>
								{/each}
								<div>
									<Price price={(data.price as any).final} />
								</div>
								steam
							</div>
						</div>
					</div>
				</div>
			</Card>
			<div class="flex gap-5">
				<Card class="grow px-4">
					{@html (data.detailedDescription as any).html}
				</Card>
			</div>
		</div>
		<div class="w-full space-y-5">
			<Card class="pr-4">
				<div class="flex flex-row justify-center gap-5 font-mono text-xs">
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
				</div>
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
								area: {
									curve: curveBasis,
									'fill-opacity': 0.4,
									line: { class: 'stroke-1' }
								},
								xAxis: {
									ticks: 7,
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
				{#if $votes.data}
					{#each $votes.data.votes as vote}
						<p>
							<Badge variant="secondary" href={`/user/${vote.user.id}`} class="mr-2 "
								>{vote.user.name}</Badge
							> voted {formatDistance(vote.createdAt, new Date(), { addSuffix: true })}
						</p>
					{/each}
				{/if}
			</Card>
		</div>
	</div>
</div>
