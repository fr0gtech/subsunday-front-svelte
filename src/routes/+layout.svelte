<script lang="ts">
	import Nav from '$lib/components/nav/nav.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import WebSockets from '$lib/components/webSockets/webSockets.svelte';
	import { Toaster } from '@/components/ui/sonner';
	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
	import { page } from '$app/state'; // use this
	$inspect(page.data);
</script>

<svelte:head>
	{#if page.data.meta}
		{#each page.data.meta as { name, content }}
			{#if name === 'title'}
				<title>{content}</title>
			{:else}
				<meta {name} {content} />
			{/if}
		{/each}
	{/if}
</svelte:head>
<QueryClientProvider client={queryClient}>
	<ModeWatcher />
	<Toaster />
	<WebSockets />
	<Nav />
	{@render children?.()}
</QueryClientProvider>
