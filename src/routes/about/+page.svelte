<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { AreaChart } from 'layerchart';
	import { curveBasis } from 'd3-shape';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { createQuery } from '@tanstack/svelte-query';
	import { formatDistance } from 'date-fns';
	import { wsVotes } from '$lib/shared.svelte';
	import Customcalendar from '$lib/components/customcalendar/customcalendar.svelte';
	import { fade, fly } from 'svelte/transition';
	import VoteStats from '@/components/voteStats/voteStats.svelte';
	import { getNowTZ } from '@/utils.js';
	const { data } = $props();

	const getVoteStats = async () => {
		const res = await fetch(`/api/votestats`);
		return await res.json();
	};
	const voteStats = createQuery({
		queryKey: ['votestats'],
		queryFn: () => getVoteStats()
	});
	const getLastVotes = async () => {
		const res = await fetch(`/api/lastvotes`);
		return await res.json();
	};

	const votes = createQuery({
		queryKey: ['lastvotesabout'],
		queryFn: () => getLastVotes()
	});
	const allVotes = $derived(
		$votes.data &&
			[...($votes.data.votes || []), ...$wsVotes]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 10)
	);
	const chartConfig = {
		votesLast7Days: { label: 'This Week', color: 'var(--chart-1)' },
		votesLastWeek: { label: 'Last Week', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="mx-auto max-w-screen-xl gap-5 space-y-5 pt-16 leading-relaxed">
	<div class="flex gap-5">
		<Card class="w-full p-5 ">
			<h1 class="text-2xl font-bold">Sub Sunday</h1>
			Sub Sunday is a weekly event where viewer of the channel can vote for games they'd like to see
			Lirik play.<br />
			<b>This does not mean that the most voted game will be played.</b> This website is a non official
			vote tracker and is not able to provide accurate data.
		</Card>
		<Card class="p-5">
			<h2 class="text-xl font-bold">How to Vote</h2>
			Voting can be done in two different ways and you don't need to be a subscriber. You can use ur
			channel points to vote!
			<Table.Root>
				<Table.Caption>A list of your recent invoices.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head>Method</Table.Head>
						<Table.Head>How</Table.Head>
						<Table.Head>For</Table.Head>
						<Table.Head>Tracked</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.Cell>Twitch Chat</Table.Cell>
						<Table.Cell
							>simply type !vote followed by the name of the game you wish to vote for.</Table.Cell
						>
						<Table.Cell>Subscriber, Everyone</Table.Cell>
						<Table.Cell><Badge class="bg-green-300"><CheckIcon /></Badge></Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>sub.vote</Table.Cell>
						<Table.Cell
							>Visit <a href="https://sub.vote" target="_blank">sub.vote</a> login and vote.</Table.Cell
						>
						<Table.Cell>Subscriber</Table.Cell>
						<Table.Cell><Badge class="bg-red-300"><XIcon /></Badge></Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</Card>
	</div>
	<div class="flex gap-5">
		<Card class="h-fit w-5/12 p-5">
			<VoteStats gameVotes={$voteStats.data} />

			<Chart.Container config={chartConfig}>
				<AreaChart
					data={data.votes}
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
		</Card>
		<div class="space-y-2">
			<Card class="p-4 text-xs">
				<h3 class="text-base font-bold">Voting period</h3>
				<pre>Sunday 00:00 - Saturday 22:00 GMT-4</pre>
			</Card>
			<div>
				<Customcalendar />
			</div>
		</div>
		<Card class="p-5 text-xs">
			{#if allVotes}
				{#each allVotes as vote (vote.id)}
					<span class="leading-relaxed" in:fly out:fade>
						<Badge variant="secondary" href={`/user/${vote.user.id}`}>{vote.user.name}</Badge> voted
						for
						<Badge variant="secondary" href={`/game/${vote.game.id}`}>{vote.game.name}</Badge>
						{formatDistance(vote.createdAt, getNowTZ(), { addSuffix: true })}
					</span>
				{/each}
			{/if}
		</Card>
	</div>
</div>
