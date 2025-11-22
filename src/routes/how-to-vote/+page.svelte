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
	import { votestats, wsVotes } from '$lib/shared.svelte';
	import Customcalendar from '$lib/components/customcalendar/customcalendar.svelte';
	import { fade, fly } from 'svelte/transition';
	import { getNowTZ } from '@/utils.js';
	import VoteStats from '@/components/voteStats/voteStats.svelte';
	const { data } = $props();

	const getLastVotes = async () => {
		const res = await fetch(`/api/lastvotes`);
		return await res.json();
	};

	const votes = createQuery(() => ({
		queryKey: ['lastvotesabout'],
		queryFn: () => getLastVotes()
	}));
	const allVotes = $derived(
		votes.data &&
			[...(votes.data.votes || []), ...$wsVotes]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 10)
	);
	const chartConfig = {
		votesLast7Days: { label: 'This Week', color: 'var(--chart-1)' },
		votesLastWeek: { label: 'Last Week', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="mx-auto max-w-screen-xl gap-5 space-y-5 p-5 pt-16 leading-relaxed lg:p-0 lg:pt-16">
	<div class="flex flex-col gap-5 lg:flex-row">
		<Card class="w-full p-5">
			<h2 class="text-xl font-bold">How to Vote</h2>
			Voting can be done in two different ways and you don't need to be a subscriber. You can use ur
			channel points to vote!
			<Table.Root>
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
</div>
