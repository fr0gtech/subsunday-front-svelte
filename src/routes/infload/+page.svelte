<script>
	import IntersectionObserver from 'svelte-intersection-observer';
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import Logo from '$lib/components/logo/logo.svelte';
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

	$: data = [...data, ...newBatch];
	$: if (intersecting && hasMore && !loading) {
		loading = true;
		page++;
		fetchData().then(() => {
			loading = false;
		});
	}
</script>

<div class="mt-5 w-full items-center justify-center">
	<div class="pt flex w-full px-5">
		<div class="grid-container">
			{#each data as game}
				<Card class="grid-item overflow-clip !py-0">
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
			{/each}
			<IntersectionObserver {element} bind:intersecting>
				<div bind:this={element}>Hello world</div>
			</IntersectionObserver>
		</div>
	</div>
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
