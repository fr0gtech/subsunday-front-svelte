<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { layout } from '$lib/shared.svelte';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>Open</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Layout</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.RadioGroup bind:value={layout.type}>
				<DropdownMenu.RadioItem value="icon">Icon View</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="list">List View</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
