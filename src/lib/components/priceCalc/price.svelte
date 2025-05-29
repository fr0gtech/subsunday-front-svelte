<script>
	export let price;
</script>

{#if typeof price === 'number'}
	${price / 100}
{:else if typeof price === 'string'}
	{price}
{:else}
	{'n/a'}
{/if}
