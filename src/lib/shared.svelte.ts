/* eslint-disable prefer-const */
import type { Vote } from './server/db/types';
import { getDateRange } from './utils';
import { writable } from 'svelte/store';

export let layout = writable({
	type: 'icon'
});

type RangePeriod = {
	currentPeriod: {
		startDate: Date;
		endDate: Date;
		nextStartDate: Date;
	};
	isSunday: boolean;
	lastPeriod: {
		startDate: Date;
		endDate: Date;
		nextStartDate: Date;
	};
};
export type VoteForFrom = Vote & { updated: boolean } & { user: { name: string; id: number } } & {
	game: { name: string; id: number };
};
export type VoteAmount = { votesThisPeriod: number; votesToday: number };

export let selectedPeriod = writable(getDateRange());
export let wsVotes = writable([]);

export const staleTime = writable(1000);
export const gcTime = writable(3000);
export const errorRate = writable(0.05);
export const queryTimeMin = writable(1000);
export const queryTimeMax = writable(2000);
export const amountOfVotes = writable({ votesThisPeriod: 0, votesToday: 0 });
