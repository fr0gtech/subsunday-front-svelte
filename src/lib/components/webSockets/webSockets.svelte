<script lang="ts">
	import { wsVotes } from '$lib/shared.svelte';
	import { io } from '$lib/websockets';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { toast } from 'svelte-sonner';
	import ToastComp from '../ToastComp.svelte';
	import { getNowTZ } from '@/utils';
	import type { TempVoteDate, WsVote } from '@/types';

	onMount(() => {
		io.emit('join', 'main');
		io.on('vote', vote);
		io.on('voteUpdate', (value) => vote(value, true));
	});
	function vote(value: WsVote, update?: boolean) {
		const now = getNowTZ();

		toast.success(ToastComp, {
			componentProps: {
				message: `<a href="/user/${value.user.id}"><b>${value.user.name}<b/></a> voted for <a href="/game/${value.game.id}"><b>${value.game.name}<b/></a>`
			}
		});
		const valWithCreatedAT = {
			...value,
			forId: value.game.id,
			fromId: value.user.id,
			updated: true,
			id: uuidv4(),
			updatedAt: now,
			createdAt: now
		} as WsVote & TempVoteDate;
		$wsVotes = [valWithCreatedAT, ...$wsVotes.slice(0, 25)];
	}
</script>
