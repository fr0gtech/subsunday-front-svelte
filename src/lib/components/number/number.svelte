<script>
	const { number } = $props();
	let locale = 'en';

	const formattedNumber = $state(
		number.toLocaleString(locale, {
			notation: 'compact',
			compactDisplay: 'short'
		})
	);
</script>

<span>{formattedNumber}</span>

<style>
	span {
		font-variant-numeric: tabular-nums;
	}
</style>
