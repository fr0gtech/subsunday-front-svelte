<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Game, User, Vote } from '$lib/server/db/types';
	import Card from '$lib/components/ui/card/card.svelte';
	import { formatDistance, formatRelative } from 'date-fns';
	import { wsVotes } from '$lib/shared.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { cn, getNowTZ } from '@/utils';
	import { Slider } from '$lib/components/ui/slider/index.js';
	let {
		data
	}: {
		data: {
			user: User & { voteRank: string; streakRank: string; votes: (Vote & { game: Game })[] };
		};
	} = $props();
	const allVotes = $derived(
		data.user.votes &&
			[
				...(data.user.votes || []),
				...$wsVotes.filter((e: any) => parseInt(e.user.id) === data.user.id)
			].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
	);
</script>

<div class="mx-auto flex max-w-screen-xl justify-center gap-4 pt-16">
	<Card class="flex gap-2 p-3">
		<div class="flex">
			<div class="flex items-center gap-2">
				<div class="relative h-20 w-20 overflow-clip rounded-full bg-neutral-800">
					{#if data.user.streak < 5}
						<img alt="fire and sparks" src="/particles/leaves.gif" class={cn('absolute')} />
					{/if}
					{#if data.user.streak > 0 && data.user.streak < 31}
						<img
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
						<img
							alt="fire and sparks"
							src="/particles/flamethrower.gif"
							class="absolute bottom-0 z-1 scale-150 -rotate-[90deg] hue-rotate-180"
						/>
					{/if}
					{#if data.user.streak > 35 && data.user.streak < 50}
						<img
							alt="fire and sparks"
							src="/particles/flamethrower.gif"
							class="absolute bottom-0 z-1 scale-150 -rotate-[45deg] hue-rotate-180"
						/>
					{/if}
					{#if data.user.streak > 40 && data.user.streak < 50}
						<img
							alt="fire and sparks"
							src="/particles/flamethrower.gif"
							class="absolute bottom-0 z-1 scale-150 rotate-[230deg] hue-rotate-180"
						/>
					{/if}
					{#if data.user.streak > 50 && data.user.streak < 60}
						<img
							alt="fire and sparks"
							src="/particles/gravity.gif"
							class="absolute bottom-0 z-0 scale-100 rotate-[230deg] -hue-rotate-60"
						/>
					{/if}
					{#if data.user.streak > 55}
						<img
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute top-0 z-0 scale-100 rotate-[10deg] -hue-rotate-60"
						/>
						<img
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute bottom-0 left-0 z-0 scale-200 -rotate-[10deg] -hue-rotate-60"
						/>
					{/if}
					{#if data.user.streak > 65}
						<img
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute top-0 z-0 scale-150 rotate-[80deg] -hue-rotate-60"
						/>
						<img
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute bottom-0 -left-1 z-0 scale-200 -rotate-[70deg] -hue-rotate-60"
						/>
					{/if}
					{#if data.user.streak > 75}
						<img
							alt="fire and sparks"
							src="/particles/spark1.gif"
							class="absolute top-0 z-0 scale-150 rotate-[120deg] -hue-rotate-60"
						/>
						<img
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
		<div class="flex flex-col gap-3 text-sm">
			<h3 class="text-xs font-bold">Recent Votes</h3>
			<div class="flex max-h-100 flex-col gap-3 overflow-scroll text-sm">
				{#each allVotes as vote}
					<div>
						{formatDistance(getNowTZ(), vote.createdAt)} ago for
						<Badge class="max-w-[200px] truncate" variant="secondary" href={`/game/${vote.game.id}`}
							>{vote.game.name}</Badge
						>
					</div>
				{/each}
			</div>
		</div>
	</Card>
</div>
