<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { selectedPeriod } from '$lib/shared.svelte';
	import { getDateRange } from '@/utils';
	import ImageWithFallback from '@/components/imageWithFallback/imageWithFallback.svelte';
	import Badge from '@/components/ui/badge/badge.svelte';
	import Button from '@/components/ui/button/button.svelte';
	import LeftArrow from '@lucide/svelte/icons/step-back';
	import RightArrow from '@lucide/svelte/icons/step-forward';
	import Skeleton from '@/components/ui/skeleton/skeleton.svelte';

	const { props } = $props();

	let topGamesPage = $state(1);
	let topUsersByVotePage = $state(1);
	let topUsersByStreakPage = $state(1);

	const topGames = createQuery(() => ({
		queryKey: ['topGames', topGamesPage],
		keepPreviousData: true,
		queryFn: async () => await fetch(`/api/topgames?p=${topGamesPage}`).then((r) => r.json())
	}));
	const topUsersByVote = createQuery(() => ({
		queryKey: ['topUsersByVote', topUsersByVotePage],
		keepPreviousData: true,
		queryFn: async () =>
			await fetch(`/api/topusersvote?p=${topUsersByVotePage}`).then((r) => r.json())
	}));
	const topUsersByStreak = createQuery(() => ({
		queryKey: ['topUserByStreak', topUsersByStreakPage],
		keepPreviousData: true,
		queryFn: async () =>
			await fetch(`/api/topuserstreak?p=${topUsersByStreakPage}`).then((r) => r.json())
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

<div class="mx-auto max-w-7xl gap-5 space-y-5 p-5 pt-16 leading-relaxed">
	<div class="flex flex-col justify-center gap-5 lg:flex-row">
		<Card class="h-fit w-full overflow-clip p-0 pt-2">
			<div class="space-y-2">
				<div class="flex items-center">
					<h2 class="p-2 text-xl font-bold">Top Games</h2>
					<div class="flex justify-between gap-5 px-5">
						<Button
							title="prev page"
							variant="secondary"
							disabled={topGamesPage === 1}
							onclick={() => topGamesPage--}
						>
							<LeftArrow />
						</Button>
						<Button
							title="next page"
							variant="secondary"
							disabled={topGamesPage * 10 >= 490}
							onclick={() => topGamesPage++}><RightArrow /></Button
						>
					</div>
				</div>
				<div>
					<div class="flex justify-between border-b-2 p-2">
						<div>Game</div>
						<div>Votes</div>
					</div>
					<div>
						{#if topGames.isLoading || topGames.isFetching || topGames.isPending}
							<div class="space-y-2">
								{#each Array(10).fill(0)}
									<div class="relative flex items-center justify-between gap-2 border-b-2 p-3">
										<div class="flex items-center gap-2">
											<div class="min-h-10">
												<Skeleton class="h-13.5 w-34 rounded-2xl bg-current/10" />
											</div>
											<div>
												<Skeleton class="h-5 w-30 rounded-2xl bg-current/10" />
											</div>
										</div>
										<div>
											<Skeleton class="h-5 w-10 rounded-2xl bg-current/10" />
										</div>
									</div>
								{/each}
							</div>
						{:else if topGames.error}
							<div>error loading data</div>
						{:else if topGames.data}
							{#each topGames.data as game, i (game.id)}
								<a href={`/game/${game.id}`}>
									<div
										class="relative flex items-center justify-between gap-2 border-b-2 p-3 hover:bg-neutral-500/20"
									>
										<Badge variant="secondary" class="absolute left-1 text-lg"
											>{'#' + (i + 1 + 10 * (topGamesPage - 1))}</Badge
										>
										<div class="flex items-center gap-2">
											<div class="min-h-15">
												<ImageWithFallback {game} />
											</div>
											<div>
												{game.name}
											</div>
										</div>
										<div>
											{game.voteCount}
										</div>
									</div>
								</a>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</Card>
		
		<div class="flex w-full flex-col gap-5 ">
			<Card class="overflow-clip p-0 pt-2">
				<div class="space-y-2">
					<div class="flex items-center">
						<h2 class="p-2 text-xl font-bold">Top Voters</h2>
						<div class="flex justify-between gap-5 px-5">
							<Button
								title="prev page"
								variant="secondary"
								disabled={topUsersByVotePage === 1}
								onclick={() => topUsersByVotePage--}
							>
								<LeftArrow />
							</Button>
							<Button
								title="next page"
								variant="secondary"
								disabled={topUsersByVotePage * 10 >= 490}
								onclick={() => topUsersByVotePage++}><RightArrow /></Button
							>
						</div>
					</div>

					<div>
						<div class="flex justify-between border-b-2 p-2">
							<div>User</div>
							<div>Votes</div>
						</div>
						<div>
							{#if topUsersByVote.isLoading || topUsersByVote.isFetching || topUsersByVote.isPending}
								{#each Array(10).fill(0)}
									<div class="relative flex h-10 items-center justify-between gap-2 border-b-2 p-3">
										<Skeleton class="h-5 w-20 rounded-2xl bg-current/10" />
										<Skeleton class="h-5 w-20 rounded-2xl bg-current/10" />
									</div>
								{/each}
							{:else if topUsersByVote.error}
								<div>error loading data</div>
							{:else if topUsersByVote.data}
								{#each topUsersByVote.data as user, i (user.id)}
									<a href={`/user/${user.id}`}>
										<div
											class="relative flex items-center justify-between gap-2 border-b-2 p-1 py-1.5 hover:bg-neutral-500/20"
										>
											<div class="flex items-center gap-2">
												<div>
													# {i + 1 + 10 * (topUsersByVotePage - 1)}
												</div>
												<div>
													{user.name}
												</div>
											</div>
											<div>
												{user.voteCount}
											</div>
										</div>
									</a>
								{/each}
							{/if}
						</div>
					</div>
				</div>
			</Card>

			<Card class="overflow-clip p-0 pt-2">
				<div class="space-y-2">
					<div class="flex items-center">
						<h2 class="p-2 text-xl font-bold">Top Streak</h2>
						<div class="flex justify-between gap-5 px-5">
							<Button
								title="prev page"
								variant="secondary"
								disabled={topUsersByStreakPage === 1}
								onclick={() => topUsersByStreakPage--}
							>
								<LeftArrow />
							</Button>
							<Button
								title="next page"
								variant="secondary"
								disabled={topUsersByStreakPage * 10 >= 490}
								onclick={() => topUsersByStreakPage++}><RightArrow /></Button
							>
						</div>
					</div>

					<div>
						<div class="flex justify-between border-b-2 p-2">
							<div>User</div>
							<div>Streak</div>
						</div>
						<div>
							{#if topUsersByStreak.isLoading || topUsersByStreak.isFetching || topUsersByStreak.isPending}
								{#each Array(10).fill(0)}
									<div class="relative flex h-10 items-center justify-between gap-2 border-b-2 p-3">
										<Skeleton class="h-5 w-20 rounded-2xl bg-current/10" />
										<Skeleton class="h-5 w-20 rounded-2xl bg-current/10" />
									</div>
								{/each}
							{:else if topUsersByStreak.error}
								<div>error loading data</div>
							{:else if topUsersByStreak.data}
								{#each topUsersByStreak.data as user, i (user.id)}
									<a href={`/user/${user.id}`}>
										<div
											class="relative flex items-center justify-between gap-2 border-b-2 p-1 py-1.5 hover:bg-neutral-500/20"
										>
											<div class="flex items-center gap-2">
												<div>
													# {i + 1 + 10 * (topUsersByStreakPage - 1)}
												</div>
												<div>
													{user.name}
												</div>
											</div>
											<div>
												{user.streak}
											</div>
										</div>
									</a>
								{/each}
							{/if}
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>
