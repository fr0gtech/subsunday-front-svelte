<script lang="ts">
	import Price from '$lib/components/priceCalc/price.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Card } from '$lib/components/ui/card';
	import type { Game } from '$lib/server/db/types';
	let { data }: { data: Game } = $props();
</script>

<div class="mx-auto max-w-screen-lg space-y-2 pt-16">
	<Card>
		<div class="space-y-2 px-4">
			<div class=" flex items-center gap-2">
				<h1 class="text-xl font-bold">{data.name}</h1>
				<div class="text-xs">reviews: {data.recommendations}</div>
			</div>
			<div class="flex gap-5">
				<img alt={`Cover image for ${data.name}`} src={data.picture} class="rounded-2xl" />
				<div class="space-y-2">
					<p class="">
						{data.description}
					</p>
					<div class="flex gap-1">
						{#each data.categories as any as category}
							<Badge>{category.description}</Badge>
						{/each}
						<div>
							<Price price={(data.price as any).final} />
						</div>
						steam
					</div>
				</div>
			</div>
		</div></Card
	>
	<Card class="px-4">
		{@html (data.detailedDescription as any).html}
	</Card>
</div>
