<script lang="ts">
	import ThemeSwitch from '$lib/components/themeSwitch/themeSwitch.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Logo from '../logo/logo.svelte';
	import DisplayList from '../displayList/displayList.svelte';
	let value = today(getLocalTimeZone());
</script>

<div
	class="bg-primary-foreground/80 fixed flex w-full items-center justify-between gap-5 p-2 backdrop-blur"
>
	<div class="flex items-center gap-2">
		<a href="/" class="flex items-center gap-2">
			<Logo />
			<h1 class="text-xl font-bold">sub-sunday</h1>
		</a>
		<a href="/about">
			<Button size={'sm'} class="ml-5">How to vote</Button>
		</a>
	</div>
	<div>
		<Popover.Root>
			<Popover.Trigger class={buttonVariants({ variant: 'outline' })}>Open</Popover.Trigger>
			<Popover.Content class=" border-none p-0">
				<Calendar type="single" bind:value class="rounded-md border" />
			</Popover.Content>
		</Popover.Root>
		<DisplayList />
	</div>
	<div>
		<ThemeSwitch />
	</div>
</div>
