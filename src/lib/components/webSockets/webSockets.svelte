<script lang="ts">
	import { wsVotes } from '$lib/shared.svelte';
	import { io } from '$lib/websockets';
	import { TZDate } from '@date-fns/tz';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { v4 as uuidv4 } from 'uuid';
	import { toast } from 'svelte-sonner';
	import ToastComp from '../ToastComp.svelte';
	import { getNowTZ } from '@/utils';

	let textfield = '';
	let username = '';

	let messages = [];

	onMount(() => {
		io.emit('join', 'main');
		io.on('vote', vote);
		io.on('voteUpdate', (value) => vote(value, true));
	});
	function vote(value: any, update?: boolean) {
		const now = getNowTZ();

		toast.success(ToastComp, {
			componentProps: {
				message: `<a href="/user/${value.user.id}"><b>${value.user.name}<b/></a> voted for <a href="/game/${value.game.id}"><b>${value.game.name}<b/></a>`
			}
		});
		const valWithCreatedAT = {
			...value,
			updated: true,
			id: uuidv4(),
			updatedAt: now,
			createdAt: now
		} as any;
		$wsVotes = [valWithCreatedAT, ...$wsVotes.slice(0, 25)];
	}
</script>
