<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { scaleUtc } from 'd3-scale';
	import { AreaChart } from 'layerchart';
	import { curveNatural } from 'd3-shape';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatDistance, getWeek, getYear } from 'date-fns';
	import { selectedPeriod, votestats, wsVotes } from '$lib/shared.svelte';
	import { fade, fly } from 'svelte/transition';
	import { getDateRange, getNowTZ } from '@/utils.js';
	import { createQuery } from '@tanstack/svelte-query';
	import Customcalendar from '@/components/customcalendar/customcalendar.svelte';
	import { Spinner } from '@/components/ui/spinner/index.js';
	import NumberFlow from '@number-flow/svelte';
	const { data } = $props();
	let context = $state<any>(null);

	const votes = createQuery(() => ({
		queryKey: ['lastvotesabout'],
		queryFn: async () => await fetch(`/api/lastvotes`).then((r) => r.json())
	}));
	const history = createQuery(() => ({
		queryKey: ['history'],
		queryFn: async () => await fetch(`/api/history`).then((r) => r.json())
	}));

	const allVotes = $derived(
		votes.data &&
			[...(votes.data.votes || []), ...$wsVotes]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 8)
	);

	const chartConfig = {
		votesLast7Days: { label: 'This Week', color: 'var(--chart-1)' },
		votesLastWeek: { label: 'Last Week', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;

	const chartConfigAll = {
		count: { label: 'Votes', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="mx-auto max-w-screen-xl gap-5 space-y-5 p-5 pt-16 leading-relaxed">
	<Alert.Root variant="destructive" class="text-xl">
		<Alert.Description class="block text-base"
			>*Vote count may be inaccurate. This project was made for fun and does not represents what
			happens to your vote.</Alert.Description
		>
	</Alert.Root>
	<div class="flex flex-wrap gap-5 lg:flex-nowrap">
		<div class=" flex flex-col space-y-5">
			<Alert.Root variant="default" class="text-xl">
				<Alert.Description class=" block text-base"
					><p class="flex items-center gap-2">
						<Spinner />Votes are currently being synchronized
					</p></Alert.Description
				>
			</Alert.Root>

			<Card class="w-full p-5 ">
				<h1 class="text-2xl font-bold">Sub Sunday</h1>
				<p>
					Sub Sunday is a weekly event where viewer of the channel can vote for games they'd like to
					see Lirik play.
					<br /><b>This does not mean that the most voted game will be played.</b> This website is a
					non official vote tracker and is not able to provide accurate data.
				</p>
			</Card>
			<Card class=" w-full p-5 ">
				<h1>Amount of votes by week</h1>
				{#if history.data && history.data.sorted}
					<Chart.Container config={chartConfigAll} class="h-40">
						<AreaChart
							bind:context
							onTooltipClick={() =>
								selectedPeriod.set(getDateRange({ offset: context.tooltip.data.date }))}
							data={history.data.sorted.map((d: { date: string | number | Date }) => ({
								...d,
								date: new Date(d.date)
							}))}
							x="date"
							xScale={scaleUtc()}
							series={[
								{
									key: 'count',
									color: chartConfigAll.count.color
								}
							]}
							seriesLayout="stack"
							props={{
								xAxis: {
									ticks: 13,
									format: (v) =>
										getWeek(v) +
										'-' +
										v.toLocaleDateString('en-US', {
											year: '2-digit'
										})
								},

								area: {
									curve: curveNatural,
									'fill-opacity': 0.4,
									line: { class: 'stroke-1' }
								}
							}}
						>
							{#snippet tooltip()}
								<Chart.Tooltip
									labelFormatter={(v: Date) =>
										getWeek(v) +
										'-' +
										v.toLocaleDateString('en-US', {
											year: '2-digit'
										})}
									indicator="line"
								/>
							{/snippet}
						</AreaChart>
					</Chart.Container>
				{/if}
			</Card>
			<Card class="w-full p-5 ">
				<h1 class="text-2xl font-bold">Github</h1>
				Open a github issue if you have any questions or want to contribute/share ideas.
				<p class="text-base">
					The code for the website you are on right now.
					<a class="text-blue-500" href="https://github.com/fr0gtech/subsunday-front-svelte"
						>fr0gtech/subsunday-front-svelte</a
					><br />
					The code for the server reading chat to track votes
					<a class="text-blue-500" href="https://github.com/fr0gtech/subsunday-back-drizzle"
						>fr0gtech/subsunday-back-drizzle</a
					>
				</p>
			</Card>
			<div class="w-full"></div>
			<div class="flex grow flex-col gap-5 lg:flex-row">
				<Card class="p-5 lg:w-1/2">
					<h2 class="text-xl font-bold">Supported Games</h2>
					Only steam games have images, price and so on but we also track non steam games just without
					any metadata. We may look at another source of info in the future to support more games.

					<h2 class="text-xl font-bold">Credit</h2>
					<p>
						Here some sources used to create this website:<br />
						<a class="text-blue-500" href="https://ragnapixel.itch.io/particle-fx">ragnapixel</a>:
						images<br />
						<a class="text-blue-500" href="https://steam.com/">Steam</a>: images, Prices,
						Descriptions<br />
						<a class="text-blue-500" href="https://lirikker.com/">lirikker.com</a>: Info about Sub
						Sunday<br />
					</p>
				</Card>
				<Card class="w-full grow p-5">
					<h2 class="text-xl font-bold">Recent Votes</h2>
					{#if allVotes}
						{#each allVotes as vote (vote.id)}
							<span class="-ml-1 text-sm leading-relaxed" in:fly out:fade>
								<Badge class="text-sm" variant="secondary" href={`/user/${vote.user.id}`}
									>{vote.user.name}</Badge
								> voted for
								<Badge class="text-sm" variant="secondary" href={`/game/${vote.game.id}`}
									>{vote.game.name}</Badge
								>
								{formatDistance(vote.createdAt, getNowTZ(), { addSuffix: true })}
							</span>
						{/each}
					{/if}
				</Card>
			</div>
		</div>
		<div class="space-y-5">
			<Card>
				<div class="flex items-center justify-center gap-5 text-center">
					<div>
						<p>
							Votes
							<Badge variant="secondary" class="text-lg">
								<NumberFlow value={$votestats.totalVotes} />
							</Badge>
						</p>
					</div>
					<div>
						<p>
							Games
							<Badge variant="secondary" class="text-lg">
								<NumberFlow value={$votestats.totalGames} />
							</Badge>
						</p>
					</div>
					<div>
						<p>
							Users
							<Badge variant="secondary" class="text-lg">
								<NumberFlow value={$votestats.totalUsers} />
							</Badge>
						</p>
					</div>
				</div>
			</Card>
			<Card class="mt-5 p-5">
				<h1>Votes this week vs votes last week</h1>
				<Chart.Container config={chartConfig}>
					<AreaChart
						data={data.thisWeekVsLastWeek}
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
								curve: curveNatural,
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
			</Card>

			<Card class="p-4 text-xs">
				<h3 class="text-base font-bold">Voting period</h3>
				<pre>Sunday 00:00 - Saturday 22:00 America/New_York</pre>
			</Card>
			<Customcalendar />
		</div>
	</div>
</div>
