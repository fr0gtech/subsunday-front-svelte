<script>
	export let game;
</script>

{#if game.picture === 'default'}
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
{/if}
