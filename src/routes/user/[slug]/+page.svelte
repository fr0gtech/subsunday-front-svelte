<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Game, User, Vote } from '$lib/server/db/types';
	import Card from '$lib/components/ui/card/card.svelte';
	import { formatDistance, formatRelative } from 'date-fns';
	let { data }: { data: { user: User & { votes: (Vote & { game: Game })[] } } } = $props();
</script>

<div class="mx-auto max-w-screen-xl space-y-2 pt-16">
	<Card class="flex gap-2 p-3">
		<h2 class="text-xl font-bold">{data.user.name}</h2>
		<span>Votes: {data.user.votes.length}</span>
		<span>Streak: {data.user.streak}</span>
		{#each data.user.votes as vote}
			<div>
				{formatDistance(new Date(), vote.createdAt)}
				<Badge href={`/user/${data.user.id}`}>{data.user.name}</Badge> voted for <Badge
					href={`/game/${vote.game.id}`}>{vote.game.name}</Badge
				>
			</div>
		{/each}
	</Card>
</div>
