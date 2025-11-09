<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import Card from '$lib/components/ui/card/card.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Alert from '$lib/components/ui/alert/index.js';

	const getVotes = async () => {
		const res = await fetch(`/api/lastvotes`);
		return await res.json();
	};
	const votes = createQuery({
		queryKey: ['lastvotesabout'],
		queryFn: () => getVotes()
	});
	const chartConfig = {
		votesLast7Days: { label: 'This Week', color: 'var(--chart-1)' },
		votesLastWeek: { label: 'Last Week', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="mx-auto max-w-screen-xl gap-5 space-y-5 p-5 pt-16 leading-relaxed">
	<Alert.Root variant="destructive" class="text-xl">
		<Alert.Description class="block text-base"
			>*Vote count may be inaccurate. This project was made for fun and does not represents what
			happens to your vote.</Alert.Description
		>
	</Alert.Root>
	<div class="flex flex-col gap-5 lg:flex-row">
		<Card class="w-full p-5 ">
			<h1 class="text-2xl font-bold">Info</h1>
			Open a github issue if you have any questions or want to contribute/share ideas.
		</Card>
		<Card class="p-5">
			<h2 class="text-xl font-bold">Supported Games</h2>
			Only steam games have images, price and so on but we also track non steam games just without any
			metadata. We may look at another source of info in the future to support more games.
		</Card>
	</div>
	<div class="flex flex-col gap-5 lg:flex-row">
		<Card class="h-fit p-5">
			<h2 class="text-xl font-bold">Credit</h2>

			<p>
				Here some sources used to create this website:<br />
				<a class="text-blue-500" href="https://ragnapixel.itch.io/particle-fx">ragnapixel</a>:
				images<br />
				<a class="text-blue-500" href="https://steam.com/">Steam</a>: images, Prices, Descriptions<br
				/>
				<a class="text-blue-500" href="https://lirikker.com/">lirikker.com</a>: Info about Sub
				Sunday<br />
			</p>
		</Card>

		<Card class=" p-5 text-xs">
			<h2 class="text-xl font-bold">Github</h2>
			<p class="text-base">
				The code for the website you are on right now.<br />
				<a class="text-blue-500" href="https://github.com/fr0gtech/subsunday-front"
					>fr0gtech/subsunday-front</a
				><br />
				The code for the server reading chat to track votes<br />
				<a class="text-blue-500" href="https://github.com/fr0gtech/subsunday-back"
					>fr0gtech/subsunday-back</a
				>
			</p>
		</Card>
	</div>
</div>
