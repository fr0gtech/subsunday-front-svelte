<script>
	import NumberFlow from '@number-flow/svelte';
	import Badge from '../ui/badge/badge.svelte';
	import Spinner from '../ui/spinner/spinner.svelte';

	let props = $props();
	let gameVotes = $state();
	$effect(() => {
		if (props.gameVotes) {
			gameVotes = props.gameVotes;
		}
	});
</script>

<div class={['flex flex-row gap-5 text-xs lowercase', props.class]}>
	<div class="flex items-start gap-2">
		<div class="h-full leading-5">Votes this week:</div>
		<div>
			<Badge class="bg-[#4627646e] !text-current" variant="secondary">
				<NumberFlow value={gameVotes ? gameVotes.votesThisPeriod : 0} />
			</Badge>
		</div>
		<!-- <Badge class="bg-[#190E24] text-[#946BBD]" variant="secondary">
			<NumberFlow value={gameVotes ? gameVotes.votesThisPeriod + $wsVotes.length : 0} />
		</Badge> -->
		<!-- <Badge variant="secondary">{gameVotes ? gameVotes.votesThisPeriod : 0}</Badge> -->
	</div>
	<div class="flex items-start gap-2">
		<div class="h-full leading-5">Votes today:</div>
		<div>
			<Badge class="bg-[#084d2671] !text-current" variant="secondary">
				<NumberFlow value={gameVotes ? gameVotes.votesToday : 0} />
			</Badge>
		</div>
		<!-- <Badge class="bg-[#190E24] text-[#946BBD]" variant="secondary">
			<NumberFlow value={gameVotes ? gameVotes.votesThisPeriod + $wsVotes.length : 0} />
		</Badge> -->
		<!-- <Badge variant="secondary">{gameVotes ? gameVotes.votesThisPeriod : 0}</Badge> -->
	</div>
</div>
