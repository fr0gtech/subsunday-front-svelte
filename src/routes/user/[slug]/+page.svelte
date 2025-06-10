<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Game, User, Vote } from '$lib/server/db/types';
	import Card from '$lib/components/ui/card/card.svelte';
	import { formatDistance, formatRelative } from 'date-fns';
	import { wsVotes } from '$lib/shared.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { getNowTZ } from '@/utils';
	let { data }: { data: { user: User & { votes: (Vote & { game: Game })[] } } } = $props();

	const allVotes = $derived(
		data.user.votes &&
			[
				...(data.user.votes || []),
				...$wsVotes.filter((e) => parseInt(e.user.id) === parseInt(data.user.id as string))
			]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.slice(0, 10)
	);
</script>

<div class="mx-auto flex max-w-screen-xl justify-center gap-4 pt-16">
	<Card class="p-2">
		<div class="">
			<img alt="fire and sparks" src="/particles/Fire+Sparks.gif" />
			<Badge variant="secondary" class="w-full">streak: {data.user.streak}</Badge>
		</div>
	</Card>
	<Card class="flex gap-2 p-3">
		<div class="flex">
			<div class="flex items-center gap-2">
				<h2 class="text-xl font-bold">{data.user.name}</h2>
				<span>votes: <Badge variant="secondary">{data.user.votes.length}</Badge></span>
			</div>
		</div>
		<Separator />
		<div class="flex flex-col gap-3 text-xs">
			{#each allVotes as vote}
				<div>
					{formatDistance(getNowTZ(), vote.createdAt)}
					<Badge variant="secondary" href={`/user/${data.user.id}`}>{data.user.name}</Badge> voted for
					<Badge variant="secondary" href={`/game/${vote.game.id}`}>{vote.game.name}</Badge>
				</div>
			{/each}
		</div>
	</Card>
</div>
