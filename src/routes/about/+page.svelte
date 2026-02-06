<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { scaleUtc } from 'd3-scale';
	import { AreaChart } from 'layerchart';
	import { curveNatural } from 'd3-shape';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatDistance, getWeek } from 'date-fns';
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

	const chartConfigAll = {
		count: { label: 'Votes', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<svelte:head>
	<title>{`About`}</title>
	<meta
		name="description"
		content="A website to track lirik's sub sunday votes. With game info, direct link to steam and more."
	/>
</svelte:head>
<div class="mx-auto max-w-screen-xl grow gap-5 space-y-5 p-5 pt-16 leading-relaxed lg:pt-16">
	<Alert.Root variant="destructive">
		<Alert.Description class="block"
			>*Vote count may be inaccurate. This project was made for fun and does not represents what
			happens to your vote.</Alert.Description
		>
	</Alert.Root>
	<div class="flex flex-wrap gap-5 lg:flex-nowrap">
		<div class=" flex w-full flex-col space-y-5 lg:w-8/12">
			<Card class="w-full p-5 ">
				<h1 class="text-lg font-bold">Sub Sunday</h1>
				<p>
					Sub Sunday is a weekly event where viewer of the channel can vote for games they'd like to
					see Lirik play.
					<br /><b>This does not mean that the most voted game will be played.</b> This website is a
					non official vote tracker and is not able to provide accurate data.
				</p>
				<pre class="  text-sm whitespace-normal">Voting period: <b>Sunday 00:00</b> - <b
						>Saturday 22:00</b
					> America/New_York</pre>
			</Card>
			<Card class=" min-h-40 w-full p-5">
				<h1 class="flex items-center gap-1">Amount of votes by week</h1>
				{#if history.isLoading}
					<div class="flex h-40 items-center justify-center">
						<Spinner />
					</div>
				{:else}
					<Chart.Container config={chartConfigAll} class="h-40">
						<AreaChart
							bind:context
							onTooltipClick={() =>
								selectedPeriod.set(getDateRange({ offset: context.tooltip.data.date }))}
							data={history.data && history.data.sorted
								? history.data.sorted.map((d: { date: string | number | Date }) => ({
										...d,
										date: new Date(d.date)
									}))
								: []}
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
								yAxis: { format: () => '' },
								xAxis: {
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
				<h1 class="text-lg font-bold">Github</h1>
				Open a github issue if you have any questions or want to contribute/share ideas.
				<p class="text-base">
					The code for the website you are on right now:
					<a class="text-blue-500" href="https://github.com/fr0gtech/subsunday-front-svelte"
						>fr0gtech/subsunday-front-svelte</a
					><br />
					The code for the server reading chat to track votes:
					<a class="text-blue-500" href="https://github.com/fr0gtech/subsunday-back-drizzle"
						>fr0gtech/subsunday-back-drizzle</a
					>
				</p>
			</Card>
			<div class="flex grow flex-col gap-5 lg:flex-row">
				<Card class="p-5 lg:w-2/3">
					<h2 class="text-lg font-bold">Supported Games</h2>
					Most games are supported and should at least get an image and a website. Steam games will have
					the most info.

					<h2 class="text-lg font-bold">Credit</h2>
					<p>
						Here some sources used to create this website:<br />
						<a class="text-blue-500" href="https://igdb.com">IGDB</a>: non steam game info<br />
						<a class="text-blue-500" href="https://ragnapixel.itch.io/particle-fx">ragnapixel</a>:
						images<br />
						<a class="text-blue-500" href="https://steam.com/">Steam</a>: steam game info<br />
						<a class="text-blue-500" href="https://lirikker.com/">lirikker.com</a>: Info about
						sub-sunday<br />
					</p>
				</Card>
				<Card class="w-full grow p-5">
					<h2 class="text-lg font-bold">Recent Votes</h2>
					{#if allVotes}
						{#each allVotes as vote (vote.id)}
							<span class=" rounded text-sm" in:fly>
								<Badge variant="outline" href={`/user/${vote.user.id}`}>{vote.user.name}</Badge> voted
								for
								<Badge
									variant="outline"
									class="max-w-[200px] truncate"
									title={vote.game.name}
									href={`/game/${vote.game.id}`}>{vote.game.name}</Badge
								>
								{formatDistance(vote.createdAt, getNowTZ(), { addSuffix: true })}
							</span>
						{/each}
					{/if}
				</Card>
			</div>
		</div>
		<div class="w-full space-y-5 lg:w-4/12">
			<Card>
				<div class="flex items-center justify-center gap-5 text-center">
					<div class="grow">
						<p>Votes</p>
						<Badge variant="secondary" class="text-lg">
							<NumberFlow value={$votestats.totalVotes || 0} />
						</Badge>
					</div>
					<div class="grow">
						<p>Games</p>
						<Badge variant="secondary" class="text-lg">
							<NumberFlow value={$votestats.totalGames || 0} />
						</Badge>
					</div>
					<div class="grow">
						<p>Users</p>
						<Badge variant="secondary" class="text-lg">
							<NumberFlow value={$votestats.totalUsers || 0} />
						</Badge>
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
			<div class="w-fit">
				<Customcalendar />
			</div>
		</div>
	</div>
</div>
