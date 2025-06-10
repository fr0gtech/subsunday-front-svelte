<script>
	import Badge from '../ui/badge/badge.svelte';

	let { gameVotes } = $props();
</script>

<div class="flex flex-row justify-center gap-5 font-mono text-xs">
	<span>
		Votes this week: <Badge variant="secondary">{gameVotes ? gameVotes.votesThisPeriod : 0}</Badge>
	</span>
	<span>
		Votes today <Badge variant="secondary">{gameVotes ? gameVotes.votesToday : 0}</Badge>
	</span>
</div>
