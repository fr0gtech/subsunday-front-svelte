<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
</script>

<svelte:head>
	<title>{`How to vote`}</title>
	<meta
		name="description"
		content="A website to track lirik's sub sunday votes. With game info, direct link to steam and more."
	/>
</svelte:head>
<div class="mx-auto max-w-screen-xl grow gap-5 space-y-5 p-5 pt-16 leading-relaxed lg:pt-16">
	<div class="flex flex-col gap-5 lg:flex-row">
		<Card class="w-full p-5">
			<h2 class="text-lg font-bold">How to Vote</h2>
			Voting can be done in two different ways and you don't need to be a subscriber. You can use your
			channel points to vote!

			<p>
				<span
					><Badge class="mr-1 bg-green-300"><CheckIcon /></Badge>Twitch Chat votes are tracked on
					this website.
				</span>
				<span></span>
				<br />
				<span
					><Badge class="mr-1 bg-red-300"><XIcon /></Badge>Votes from sub.vote are not tracked on
					this website
				</span>
			</p>

			<p>
				<b>Twitch Chat</b> (subscriber and all with channel points): Simply type !vote followed by the
				name of the game you wish to vote for.
			</p>
			<p>
				<b>sub.vote</b> (subscriber only): Visit
				<a href="https://sub.vote" target="_blank">sub.vote</a> login and vote.
			</p>

			<!-- <Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Method</Table.Head>
						<Table.Head>How</Table.Head>
						<Table.Head>For</Table.Head>
						<Table.Head>Tracked</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.Cell>Twitch Chat</Table.Cell>
						<Table.Cell
							>simply type !vote followed by the name of the game you wish to vote for.</Table.Cell
						>
						<Table.Cell>Subscriber, Everyone</Table.Cell>
						<Table.Cell><Badge class="bg-green-300"><CheckIcon /></Badge></Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>sub.vote</Table.Cell>
						<Table.Cell
							>Visit <a href="https://sub.vote" target="_blank">sub.vote</a> login and vote.</Table.Cell
						>
						<Table.Cell>Subscriber</Table.Cell>
						<Table.Cell><Badge class="bg-red-300"><XIcon /></Badge></Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root> -->
		</Card>
	</div>
</div>
