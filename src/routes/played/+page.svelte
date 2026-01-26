<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { createQuery } from '@tanstack/svelte-query';
	import ImageWithFallback from '@/components/imageWithFallback/imageWithFallback.svelte';
	import { Skeleton } from '@/components/ui/skeleton';
	import { Button, buttonVariants } from '@/components/ui/button';
	import LeftArrow from '@lucide/svelte/icons/step-back';
	import RightArrow from '@lucide/svelte/icons/step-forward';
	import { formatDistance, formatDuration, getWeek, getYear, intervalToDuration } from 'date-fns';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { formatDurationCompact, getDateRange } from '@/utils';
	import { selectedPeriod } from '@/shared.svelte';
	import NumberFlow from '@number-flow/svelte';
	let pastStreamsPage = $state(1);
	let playedGamesPage = $state(1);

	const pastStreams = createQuery(() => ({
		queryKey: ['pastStreams'],
		keepPreviousData: true,
		queryFn: async () => await fetch(`/api/paststreams?p=${pastStreamsPage}`).then((r) => r.json())
	}));

	const playedGames = createQuery(() => ({
		queryKey: ['playedGames'],
		keepPreviousData: true,
		queryFn: async () => await fetch(`/api/playedgames?p=${playedGamesPage}`).then((r) => r.json())
	}));
</script>

<svelte:head>
	<title>{`Played Games`}</title>
	<meta
		name="description"
		content="A website to track lirik's sub sunday votes. With game info, direct link to steam and more."
	/>
</svelte:head>
<div class="mx-auto max-w-screen-xl grow gap-5 space-y-5 p-5 pt-16 leading-relaxed lg:pt-16">
	<div class="flex flex-col gap-5 lg:flex-row">
		<Card class="h-fit w-full overflow-clip p-0 pt-2">
			<div class="space-y-2">
				<div class="flex flex-wrap items-center justify-between">
					<h2 class="p-5 text-lg font-bold">Past sub sunday streams</h2>
					<div class="flex items-center justify-between gap-5 px-5">
						<Button
							title="prev page"
							variant="secondary"
							disabled={pastStreamsPage === 1}
							onclick={() => pastStreamsPage--}
						>
							<LeftArrow />
						</Button>
						<span class="font-mono text-xs">
							page {pastStreamsPage}
						</span>
						<Button
							title="next page"
							variant="secondary"
							disabled={pastStreams.data ? pastStreams.data.length < 10 : true}
							onclick={() => pastStreamsPage++}><RightArrow /></Button
						>
					</div>
				</div>
				<div>
					<div class="mt-5 space-y-5">
						{#if pastStreams.data}
							{#each pastStreams.data as stream, i (stream.id)}
								<!-- {JSON.stringify(stream)} -->
								<Collapsible.Root class=" space-y-2">
									<div
										class="m-5 flex items-center justify-between space-x-4 rounded-xl bg-current/4 p-3"
									>
										<h4 class=" text-sm">
											<b>{formatDistance(stream.publishedAt, new Date(), { addSuffix: true })}</b>
											(<button
												onclick={() =>
													($selectedPeriod = getDateRange({
														offset: stream.publishedAt
													}))}
												class="cursor-pointer text-sky-500 italic"
											>
												<NumberFlow value={getWeek(stream.publishedAt)} /> -
												{getYear(stream.publishedAt)}
											</button>) streamed for
											<b>
												{formatDuration(
													intervalToDuration({
														start: 0,
														end: stream.duration * 1000
													}),
													{ format: ['hours', 'minutes'] }
												)}
											</b>
											and played
											<b>
												{stream.moments.length} games
											</b>
										</h4>
										<Collapsible.Trigger
											class={buttonVariants({ variant: 'ghost', size: 'sm', class: 'w-9 p-0' })}
										>
											<ChevronsUpDownIcon />
											<span class="sr-only">Toggle</span>
										</Collapsible.Trigger>
									</div>

									<Collapsible.Content class="space-y-2 px-5">
										{#each stream.moments as moment (moment.id)}
											{@const dur = formatDurationCompact(moment.durationMilliseconds / 1000)}
											{@const pos = formatDurationCompact(moment.positionMilliseconds / 1000)}

											<div class="rounded-md border px-4 py-3 text-sm">
												played
												<b>
													<a href={`${moment.game ? `/game/${moment.game.id}` : ''}`}>
														{moment.description}
													</a>
												</b>
												for
												<b>
													<a
														class="text-blue-500"
														href={`https://www.twitch.tv/videos/${stream.streamId}?t=${pos.replaceAll(' ', '')}`}
													>
														{dur}
													</a>
												</b>
											</div>
										{/each}
									</Collapsible.Content>
								</Collapsible.Root>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</Card>
		<Card class="h-fit w-full overflow-clip p-0 pt-2">
			<div class="space-y-2">
				<div class="flex flex-wrap items-center justify-between">
					<h2 class="p-5 text-lg font-bold">Longest sub sunday segments</h2>
					<div class="flex items-center justify-between gap-5 px-5">
						<Button
							title="prev page"
							variant="secondary"
							disabled={playedGamesPage === 1}
							onclick={() => playedGamesPage--}
						>
							<LeftArrow />
						</Button>
						<span class="font-mono text-xs whitespace-nowrap">
							page {playedGamesPage}
						</span>
						<Button
							title="next page"
							variant="secondary"
							disabled={pastStreams.data ? pastStreams.data.length < 10 : true}
							onclick={() => playedGamesPage++}><RightArrow /></Button
						>
					</div>
				</div>
				<div>
					<div class="mt-5 space-y-5">
						{#if playedGames.data}
							{#each playedGames.data as playedGame, i (playedGame.id)}
								<a href={`/game/${playedGame.game.id}`} class="group">
									<div
										class="relative flex items-center justify-between gap-2 border-b-2 p-3 group-last:border-0 hover:bg-neutral-500/20"
									>
										<Badge variant="secondary" class="absolute left-1 text-lg"
											>{'#' + (i + 1 + 10 * (playedGamesPage - 1))}</Badge
										>
										<div class="mr-2 min-h-15">
											<ImageWithFallback game={playedGame.game} />
										</div>
										<p class=" text-ellipsis">
											{playedGame.game.name} - {formatDuration(
												intervalToDuration({
													start: 0,
													end: playedGame.durationMilliseconds
												}),
												{ format: ['hours', 'minutes'] }
											)}
										</p>
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
