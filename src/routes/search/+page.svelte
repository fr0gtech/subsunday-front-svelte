<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/components/ui/card/card.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import ImageWithFallback from '@/components/imageWithFallback/imageWithFallback.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { onMount } from 'svelte';
	const { data } = $props();

	let query = $state<any>('');
	let searchData = $state<any>(null);
	let firstSearch = $state(true);

	const getSearch = async () => {
		const res = await fetch(`/api/search?q=${query}`);
		return await res.json();
	};

	const searchStuff = async () => {
		searchData = await getSearch();
		page.url.searchParams.set('q', query);
		replaceState(page.url, page.state);
	};

	onMount(() => {
		if (page.url.searchParams.get('q')) {
			query = page.url.searchParams.get('q');
			searchStuff();
		}
	});

	$effect(() => {
		if (page.url.searchParams.get('q')) {
			query = page.url.searchParams.get('q');
			searchStuff();
		}
	});
	// $effect(() => {
	// 	const hasProp = page.url.searchParams.get('q');
	// 	triggerSubmit(hasProp);
	// });
</script>

<div class="mx-auto max-w-screen-xl gap-5 space-y-5 p-5 pt-16 leading-relaxed">
	<Card>
		<div class="w-full px-5">
			<InputGroup.Root onkeydown={(e) => e.key === 'Enter' && searchStuff()}>
				<InputGroup.Input bind:value={query} name="search" placeholder="Search..." />
				<InputGroup.Addon>
					<SearchIcon />
				</InputGroup.Addon>
				{#if searchData}
					<InputGroup.Addon align="inline-end"
						>{searchData.games.length + searchData.users.length} results
					</InputGroup.Addon>
				{/if}
			</InputGroup.Root>
		</div>
	</Card>
	<div class="flex flex-wrap gap-5 lg:flex-nowrap">
		<Card class="m-0 block max-w-full overflow-clip p-0 lg:w-1/2">
			<div class=" border-b border-neutral-800">
				<h1 class="mt-4 mb-2 ml-3 text-lg">Game Search Results</h1>
			</div>
			{#if searchData && searchData.games}
				<div class="flex flex-col">
					{#each searchData.games as game}
						<a href={`game/${game.id}`}>
							<div class="flex items-center gap-4 border-b py-3 hover:bg-neutral-800/50">
								<ImageWithFallback {game} />
								<!-- {#if game.picture === 'default'}
									<div
										class="bg-muted text-muted-foreground ml-2 flex h-20 w-32! min-w-32! items-center justify-center rounded-xl"
									>
										No Image
									</div>
								{:else}
									<img
										src={game.picture ? `${game.picture}` : '/no-image-184x69.png'}
										alt={game.name}
										class="ml-2 w-32 rounded-xl object-contain"
									/>
								{/if} -->
								<div class="truncate">
									{game.name}
								</div>
								<div class="pr-2 text-xs whitespace-nowrap">
									votes: {game.voteCount}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</Card>
		<Card class="m-0 block w-full max-w-full overflow-clip p-0 lg:w-1/2">
			<div class=" border-b border-neutral-800">
				<h1 class="mt-4 mb-2 ml-3 text-lg">User Search Results</h1>
			</div>
			{#if searchData && searchData.users}
				{#each searchData.users as user}
					<a href={`user/${user.id}`}>
						<div class="flex items-center gap-4 truncate border-b py-3 hover:bg-neutral-800/50">
							<span class="ml-2">
								{user.name}
							</span>
							<div class="text-xs">
								votes: {user.voteCount}
							</div>
						</div>
					</a>
				{/each}
			{/if}
		</Card>
		<!-- <div class="">
			<h1 class="my-4 ml-5 text-2xl font-bold">Game Search Results</h1>
			{#if searchData && searchData.games}
				<div class="flex flex-col gap-5">
					{#each searchData.games as game}
						<a href={`game/${game.id}`}>
							<div class="flex items-center gap-4 truncate border-b pb-3">
								{#if game.picture === 'default'}
									<div
										class="bg-muted text-muted-foreground ml-2 flex h-20 w-32 items-center justify-center rounded-xl"
									>
										No Image
									</div>
								{:else}
									<img
										src={game.picture ? `${game.picture}` : '/no-image-184x69.png'}
										alt={game.name}
										class="ml-2 w-32 rounded-xl object-contain"
									/>
								{/if}
								{game.name}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div> -->
	</div>
</div>
