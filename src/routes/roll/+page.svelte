<script>
	/** @type {number} */
	// @ts-ignore
	let number = $state();

	async function roll() {
		const response = await fetch('/api/games');
		number = await response.json();
		console.log(number);
	}
</script>

<button onclick={roll}>Roll the dice</button>

{#if number !== undefined}
	<p>You rolled a {number}</p>
{/if}
