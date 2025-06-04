<script>
	import IntersectionObserver from '$lib/IntersectionObserver.svelte';
	let intersecting;
	$effect(() => {
		if (intersecting) {
			console.log(intersecting);
		}
	});
</script>

<div class="flex flex h-screen items-center justify-center bg-purple-500">
	{intersecting}
</div>
<div class="bg-red-500 pt-20">
	<IntersectionObserver bind:intersecting>
		<div>test {intersecting}</div>
	</IntersectionObserver>
</div>
