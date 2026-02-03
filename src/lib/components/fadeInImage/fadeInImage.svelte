<script>
	let { src, alt, class: className = '', duration = 500, ...props } = $props();
	let loaded = $state(false);
</script>

<img
	{src}
	{alt}
	class="{className} {loaded ? 'loaded' : ''}"
	onload={() => (loaded = true)}
	{...props}
/>

<style>
	img {
		opacity: 0;
		transition: opacity var(--duration, 0.5s) ease-in-out;
	}

	img.loaded {
		opacity: 1;
	}
</style>
