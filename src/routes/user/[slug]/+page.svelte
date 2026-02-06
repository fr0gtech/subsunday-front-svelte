<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Game, User, Vote } from '$lib/server/db/types';
	import Card from '$lib/components/ui/card/card.svelte';
	import { formatDistance, formatISO } from 'date-fns';
	import { selectedPeriod, wsVotes } from '$lib/shared.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { cn, getDateRange, getNowTZ, getRangeFromDate } from '@/utils';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { CalendarDateTime, today } from '@internationalized/date';
	import { CalendarDate } from '@internationalized/date';
	import FadeInImage from '@/components/fadeInImage/fadeInImage.svelte';
	import { X } from 'lucide-react';

	let {
		data
	}: {
		data: {
			user: User & { voteRank: string; streakRank: string; votes: (Vote & { game: Game })[] };
		};
	} = $props();
	let placeholder = $state(new CalendarDateTime(2024, 8, 3, 12, 30));
	let value = $derived(
		data.user.votes.map((e) => {
			return new CalendarDate(
				e.createdAt.getFullYear(),
				e.createdAt.getMonth() + 1,
				e.createdAt.getDate()
			);
		})
	);
	const allVotes = $derived(
		data.user.votes &&
			[...data.user.votes, ...$wsVotes.filter((e: any) => parseInt(e.user.id) === data.user.id)]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.filter((v: any, i, arr) => {
					if (i === 0) return true;
					const prev: any = arr[i - 1];
					return !(
						prev.fromId === v.fromId &&
						prev.forId === v.forId &&
						Math.abs(new Date(prev.createdAt).getTime() - new Date(v.createdAt).getTime()) < 1000
					);
				})
	);
</script>

<div
	class="mx-auto flex w-full max-w-screen-xl grow flex-wrap justify-center gap-5 space-y-5 p-5 pt-16 leading-relaxed lg:pt-16"
>
	<Card class="flex h-fit gap-2 p-3 lg:w-1/2">
		<div class="flex">
			<div class="flex items-center gap-2">
				<div class="relative h-20 w-20 overflow-clip rounded-full bg-neutral-800">
					{#if data.user.streak < 5}
						<FadeInImage alt="fire and sparks" src="/particles/leaves.gif" class={cn('absolute')} />
					{/if}
					{#if data.user.streak > 0 && data.user.streak < 31}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/fire_sparks.gif"
							class={cn(
								'absolute z-10 grayscale',
								data.user.streak > 5 && 'grayscale-50',
								data.user.streak > 10 && 'saturate-150',
								data.user.streak > 15 && 'hue-rotate-180',
								data.user.streak > 20 && 'hue-rotate-60',
								data.user.streak > 20 && 'hue-rotate-180'
							)}
						/>
					{/if}

					{#if data.user.streak > 30 && data.user.streak < 50}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/flamethrower.gif"
							class="absolute bottom-0 z-1 scale-150 -rotate-[90deg] hue-rotate-180"
						/>
					{/if}
					{#if data.user.streak > 35 && data.user.streak < 50}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/flamethrower.gif"
							class="absolute bottom-0 z-1 scale-150 -rotate-[45deg] hue-rotate-180"
						/>
					{/if}
					{#if data.user.streak > 40 && data.user.streak < 50}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/flamethrower.gif"
							class="absolute bottom-0 z-1 scale-150 rotate-[230deg] hue-rotate-180"
						/>
					{/if}
					{#if data.user.streak > 50 && data.user.streak < 60}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/gravity.gif"
							class="absolute bottom-0 z-0 scale-100 rotate-[230deg] -hue-rotate-60"
						/>
					{/if}
					{#if data.user.streak > 55}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute top-0 z-0 scale-100 rotate-[10deg] -hue-rotate-60"
						/>
						<FadeInImage
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute bottom-0 left-0 z-0 scale-200 -rotate-[10deg] -hue-rotate-60"
						/>
					{/if}
					{#if data.user.streak > 65}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute top-0 z-0 scale-150 rotate-[80deg] -hue-rotate-60"
						/>
						<FadeInImage
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute bottom-0 -left-1 z-0 scale-200 -rotate-[70deg] -hue-rotate-60"
						/>
					{/if}
					{#if data.user.streak > 75}
						<FadeInImage
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute top-0 z-0 scale-150 rotate-[120deg] -hue-rotate-60"
						/>
						<FadeInImage
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute bottom-0 -left-1 z-0 scale-200 -rotate-[130deg] -hue-rotate-60"
						/>
					{/if}
				</div>
				<div class="font-mono! text-xs">
					<a href={`https://twitch.tv/${data.user.name}`}>
						<h2 class="text-lg font-bold">{data.user.name}</h2>
					</a>
					<span
						>votes<Badge variant="secondary"
							>{data.user.votes.length}
							{#if parseInt(data.user.voteRank) === 0}
								<span class="text-amber-400">(#{parseInt(data.user.voteRank) + 1})</span>
							{:else if parseInt(data.user.voteRank) === 1}
								<span class="text-orange-400">(#{parseInt(data.user.voteRank) + 1})</span>
							{:else if parseInt(data.user.voteRank) === 2}
								<span class="text-gray-400">(#{parseInt(data.user.voteRank) + 1})</span>
							{:else}
								<span>(#{parseInt(data.user.voteRank) + 1})</span>
							{/if}
						</Badge></span
					>
					<span
						>streak<Badge variant="secondary"
							>{data.user.streak}
							{#if parseInt(data.user.streakRank) === 0}
								<span class="text-amber-400">(#{parseInt(data.user.streakRank) + 1})</span>
							{:else if parseInt(data.user.streakRank) === 1}
								<span class="text-orange-400">(#{parseInt(data.user.streakRank) + 1})</span>
							{:else if parseInt(data.user.streakRank) === 2}
								<span class="text-gray-400">(#{parseInt(data.user.streakRank) + 1})</span>
							{:else}
								<span>(#{parseInt(data.user.streakRank) + 1})</span>
							{/if}
						</Badge>
					</span>
				</div>
			</div>
		</div>

		<Separator />
		<div class="relative flex flex-col gap-3 text-sm">
			<h3 class="text-xs font-bold">All Votes</h3>
			<div
				class=" flex h-fit max-h-[400px] flex-col gap-2 overflow-x-visible overflow-y-scroll text-sm"
			>
				{#each allVotes as vote}
					{@const period = getRangeFromDate(vote.createdAt)}
					{@const highlight =
						vote.createdAt.getMonth() + 1 === placeholder.month &&
						vote.createdAt.getFullYear() === placeholder.year}
					<button
						onclick={() => {
							placeholder = new CalendarDateTime(
								vote.createdAt.getFullYear(),
								vote.createdAt.getMonth() + 1,
								1
							);
							selectedPeriod.set(getDateRange({ offset: vote.createdAt }));
						}}
						class="flex cursor-pointer! flex-col items-start gap-1 rounded-md bg-neutral-800/50 p-2 shadow-sm"
					>
						<div class=" flex gap-2">
							<div>
								{formatDistance(getNowTZ(), vote.createdAt)} ago
							</div>
							<div class={['cursor-pointer text-sky-400', highlight && 'text-orange-500!']}>
								{#if period}
									{period[0]} - {period[1]}
								{/if}
							</div>
						</div>

						<!-- {formatDistance(getNowTZ(), vote.createdAt)} ago for -->
						<Badge variant="secondary" class="text-sm! text-ellipsis" href={`/game/${vote.game.id}`}
							>{vote.game.name}</Badge
						>
					</button>
				{/each}
			</div>
		</div>
	</Card>
	<div class="space-y-5">
		<Card class="py-0!">
			<Calendar type="multiple" bind:value bind:placeholder readonly class="mx-auto" />
		</Card>
		<Card class=" py-0!">
			<div class="flex w-full flex-col gap-2 p-3">
				{#each allVotes
					.filter((e) => {
						if (e.createdAt.getMonth() + 1 === placeholder.month && e.createdAt.getFullYear() === placeholder.year) {
							return true;
						}
					})
					.sort((a, b) => a.createdAt.getDate() - b.createdAt.getDate()) as vote (vote.id)}
					<div
						class="bg-muted after:bg-primary/70 relative rounded-md p-2 ps-6 text-sm after:absolute after:inset-y-2 after:start-2 after:w-1 after:rounded-full"
					>
						<div class="font-medium">{vote.game.name}</div>
						<div class="text-muted-foreground text-xs">
							{formatISO(vote.createdAt, { representation: 'date' })}
						</div>
						<div class="text-muted-foreground text-xs">{vote.voteText || ''}</div>
					</div>
				{/each}
			</div>
		</Card>
	</div>
</div>
