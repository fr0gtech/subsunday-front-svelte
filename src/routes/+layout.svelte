<script lang="ts">
	import Nav from '$lib/components/nav/nav.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import WebSockets from '$lib/components/webSockets/webSockets.svelte';
	import { Toaster } from '@/components/ui/sonner';
	import { page } from '$app/state'; // use this
	import Footer from '@/components/footer/footer.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let { children } = $props();
	export const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
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
	<Tooltip.Provider delayDuration={0}>
		<div class="flex min-h-screen flex-col">
			<ModeWatcher />
			<Toaster />
			<WebSockets />
			<Nav />
			{@render children?.()}
			<!-- <Footer /> -->
		</div>
	</Tooltip.Provider>
</QueryClientProvider>
