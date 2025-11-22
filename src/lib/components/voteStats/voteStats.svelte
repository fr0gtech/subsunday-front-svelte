<script>
	import NumberFlow from '@number-flow/svelte';
	import Badge from '../ui/badge/badge.svelte';
	import { votestats, wsVotes } from '@/shared.svelte';
	import Spinner from '../ui/spinner/spinner.svelte';
	import { cn } from 'tailwind-variants';

	let props = $props();
</script>

<div class={['flex flex-row gap-5 text-xs lowercase', props.class]}>
	<div class="flex items-start gap-2">
		<div class="h-full leading-5">Votes this week:</div>
		<div>
			{#if $votestats}
				<Badge class="bg-[#4627646e] !text-current" variant="secondary">
					<NumberFlow value={$votestats ? $votestats.votesThisPeriod : 0} />
				</Badge>
			{:else}
				<Spinner class="mx-3" />
			{/if}
		</div>
		<!-- <Badge class="bg-[#190E24] text-[#946BBD]" variant="secondary">
			<NumberFlow value={gameVotes ? gameVotes.votesThisPeriod + $wsVotes.length : 0} />
		</Badge> -->
		<!-- <Badge variant="secondary">{gameVotes ? gameVotes.votesThisPeriod : 0}</Badge> -->
	</div>
	<div class="flex items-start gap-2">
		<div class="h-full leading-5">Votes today:</div>
		<div>
			{#if $votestats}
				<Badge class="bg-[#084d2671] !text-current" variant="secondary">
					<NumberFlow value={$votestats ? $votestats.votesToday + $wsVotes.length : 0} />
				</Badge>
			{:else}
				<Spinner class="mx-3" />
			{/if}
		</div>
		<!-- <Badge class="bg-[#190E24] text-[#946BBD]" variant="secondary">
			<NumberFlow value={gameVotes ? gameVotes.votesThisPeriod + $wsVotes.length : 0} />
		</Badge> -->
		<!-- <Badge variant="secondary">{gameVotes ? gameVotes.votesThisPeriod : 0}</Badge> -->
	</div>
</div>
