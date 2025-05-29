<script lang="ts">
	import Nav from '$lib/components/nav/nav.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	let { children } = $props();
</script>

<ModeWatcher />
<Nav />
{@render children?.()}
