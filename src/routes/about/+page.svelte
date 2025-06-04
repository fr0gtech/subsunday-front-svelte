<script lang="ts">
	// @ts-nocheck

	import Card from '$lib/components/ui/card/card.svelte';
	import { BarChart, LineChart } from 'layerchart';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { scaleTime } from 'd3-scale';

	let { data } = $props();

	let chartData = $state();
	chartData = data.votes;
	$inspect(chartData);
	const chartConfig = {
		desktop: {
			label: 'value',
			color: '#ff00ff'
		}
	} satisfies Chart.ChartConfig;
</script>

<div class="mx-auto max-w-screen-xl pt-16">
	<Card>
		<Chart.Container>
			<LineChart data={chartData} x="date" y="value" xScale={scaleTime()}></LineChart>
		</Chart.Container>
	</Card>
</div>
