<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { onMount } from 'svelte';
	import { selectedPeriod } from '$lib/shared.svelte';
	import { getDateRange } from '@/utils';
	import ImageWithFallback from '@/components/imageWithFallback/imageWithFallback.svelte';

	const { props } = $props();

	const getTop = async () => {
		const res = await fetch(`/api/top`);
		return await res.json();
	};
	const votes = createQuery(() => ({
		queryKey: ['topVotes'],
		queryFn: () => getTop()
	}));
	onMount(async () => {
		if ($selectedPeriod === null) {
			if (props && parseInt(props.period as string) > 0) {
				selectedPeriod.set(getDateRange({ offset: new Date(parseInt(props.period as string)) }));
			} else {
				selectedPeriod.set(getDateRange());
			}
		}
	});
</script>

<div class="mx-auto max-w-screen-xl gap-5 space-y-5 p-5 pt-16 leading-relaxed">
	<div class="flex flex-col justify-center gap-5 lg:flex-row">
		{#if votes.data}
			<Card>
				<Table.Root class="flex w-full flex-col">
					<Table.Caption class="mt-0 mb-3 text-base font-bold text-current"
						>Top Games by votes</Table.Caption
					>
					<Table.Header class="min-w-[300px]">
						<Table.Row>
							<Table.Head>Rank</Table.Head>
							<Table.Head class="w-full">Game</Table.Head>
							<Table.Head>Votes</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each votes.data.topGames as game, i}
							<Table.Row>
								<a href={`/game/${game.id}`}>
									<Table.Cell class="font-medium"># {i + 1}</Table.Cell>
									<Table.Cell class="w-full">
										<div class="flex items-center gap-3">
											<ImageWithFallback {game} />
											{game.name}
										</div>
									</Table.Cell>
									<Table.Cell>{game._count.votes}</Table.Cell>
								</a>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card>
			<div class="flex flex-col gap-5">
				<Card>
					<Table.Root class="flex w-full flex-col ">
						<Table.Caption class="mt-0 mb-3  font-bold text-current"
							>Top Users by votes</Table.Caption
						>
						<Table.Header class="min-w-[300px] ">
							<Table.Row>
								<Table.Head class="">Rank</Table.Head>
								<Table.Head class="w-full">User</Table.Head>
								<Table.Head>Votes</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each votes.data.topUsers as vote, i}
								<Table.Row class="block w-full ">
									<a href={`/user/${vote.id}`}>
										<Table.Cell class="font-medium"># {i + 1}</Table.Cell>
										<Table.Cell class="w-full">{vote.name}</Table.Cell>
										<Table.Cell>{vote.voteCount}</Table.Cell>
									</a>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card>
				<Card>
					<Table.Root class="flex w-full flex-col">
						<Table.Caption class="mt-0 mb-3 text-base font-bold text-current"
							>Top Users by streak</Table.Caption
						>
						<Table.Header class="min-w-[300px]">
							<Table.Row>
								<Table.Head class="">Rank</Table.Head>
								<Table.Head class="w-full">User</Table.Head>
								<Table.Head>Streak</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each votes.data.topStreak as vote, i}
								<Table.Row class="block w-full">
									<a href={`/user/${vote.id}`}>
										<Table.Cell class="font-medium"># {i + 1}</Table.Cell>
										<Table.Cell class="w-full">{vote.name}</Table.Cell>
										<Table.Cell>{vote.streak}</Table.Cell>
									</a>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card>
			</div>
		{/if}
	</div>
</div>
