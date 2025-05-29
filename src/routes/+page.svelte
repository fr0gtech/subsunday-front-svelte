<script>
	import IntersectionObserver from 'svelte-intersection-observer';
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import Logo from '$lib/components/logo/logo.svelte';
	import Nav from '$lib/components/nav/nav.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Price from '$lib/components/priceCalc/price.svelte';
	import { layout } from '$lib/shared.svelte';
	let element;
	/**
	 * @type {boolean}
	 */
	let intersecting;
	let loading = false;
	let page = 0;
	let hasMore = true;
	let data = [];
	let newBatch = [];

	async function fetchData() {
		const response = await fetch(`/api/games?page=${page}`);
		let res = await response.json();
		hasMore = res.hasMore;
		newBatch = res.games;
	}

	onMount(() => {
		fetchData();
	});

	$: data = [...data, ...newBatch].sort((a, b) => b.voteCount - a.voteCount);
	$: if (intersecting && hasMore && !loading) {
		loading = true;
		page++;
		fetchData().then(() => {
			loading = false;
		});
	}
</script>

<div class="flex flex-col">
	<div class="z-10 h-[50px]">
		<Nav />
	</div>
	{#if layout.type === 'icon'}
		<div class="mt-5 w-full items-center justify-center">
			<div class="flex w-full px-5">
				<div class="grid-container">
					{#each data as game, i}
						<a href={`game/${game.id}`}>
							<Card class="grid-item relative overflow-clip !py-0">
								<Badge
									class=" bg-primary-foreground text-primary-background absolute top-1 left-1 z-10"
									variant="default"
								>
									# {i + 1}
									{game.name}
								</Badge>
								<Badge
									class="bg-primary-foreground text-primary-background absolute top-1 right-1 z-10 "
									variant="default"
								>
									<Price price={game.price.final} />
								</Badge>
								<Badge
									class="bg-primary-foreground text-primary-background absolute right-1 bottom-1 z-10 "
									variant="default"
								>
									votes: {game.voteCount}
								</Badge>
								<div class="absolute bottom-1 left-1 z-20 flex gap-1 opacity-90">
									{#each game.categories as category}
										<Badge variant="default" class="bg-primary-foreground text-primary-background ">
											{category.description}
										</Badge>
									{/each}
								</div>
								<div class="h-[140px]">
									{#if game.picture !== 'default'}
										<div class="relative w-full">
											<img
												class="absolute top-0 object-cover"
												alt={`${game.name} image`}
												src={game.picture}
											/>
										</div>
									{:else}
										<div class="flex h-full w-full flex-col items-center justify-center">
											<Logo />
											<p class="text-center text-xs">no image</p>
										</div>
									{/if}
								</div>
							</Card>
						</a>
					{/each}
					<IntersectionObserver {element} bind:intersecting>
						<div bind:this={element}>Hello world</div>
					</IntersectionObserver>
				</div>
			</div>
		</div>
	{:else}
		<div class="mt-5 w-full items-center justify-center">
			<div class="flex w-full px-5">
				<div class="grid-container">
					{#each data as game, i}
						<a href={`game/${game.id}`}>
							<Card class="grid-item relative flex flex-row overflow-clip !py-0">
								<div class=" h-[50px] w-[100px]">
									{#if game.picture !== 'default'}
										<div class="relative w-full">
											<img
												class="absolute top-0 object-cover"
												alt={`${game.name} image`}
												src={game.picture}
											/>
										</div>
									{:else}
										<div class="flex h-full w-full flex-col items-center justify-center">
											<Logo />
											<p class="text-center text-xs">no image</p>
										</div>
									{/if}
								</div>
								<div>
									<Badge
										class=" bg-primary-foreground text-primary-background  z-10"
										variant="default"
									>
										# {i + 1}
										{game.name}
									</Badge>
									<Badge
										class="bg-primary-foreground text-primary-background  z-10 "
										variant="default"
									>
										<Price price={game.price.final} />
									</Badge>
									<Badge
										class="bg-primary-foreground text-primary-background z-10 "
										variant="default"
									>
										votes: {game.voteCount}
									</Badge>
									<div class="z-20 flex gap-1 opacity-90">
										{#each game.categories as category}
											<Badge
												variant="default"
												class="bg-primary-foreground text-primary-background "
											>
												{category.description}
											</Badge>
										{/each}
									</div>
								</div>
							</Card>
						</a>
					{/each}
					<IntersectionObserver {element} bind:intersecting>
						<div bind:this={element}>Hello world</div>
					</IntersectionObserver>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.grid-container {
		display: grid;
		width: 100vw;
		height: 100%;
		gap: 3em;
		grid-template-columns: repeat(auto-fit, minmax(clamp(330px, 100%, 330px), 1fr));
	}
	.grid-item {
		display: flex;
		justify-content: center;
	}
	.fixed3 {
		grid-column-end: -1;
		grid-row: 1;
	}
	.fixed2 {
		grid-column-end: -1;
		grid-column-start: span 2;
		grid-row-start: 2;
	}
</style>
