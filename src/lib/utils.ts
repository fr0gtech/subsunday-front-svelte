import { replaceState } from '$app/navigation';
import {
	PUBLIC_FROM_DAY,
	PUBLIC_FROM_TIME,
	PUBLIC_TO_DAY,
	PUBLIC_TO_TIME,
	PUBLIC_TZ
} from '$env/static/public';
import { tz, TZDate } from '@date-fns/tz';
import type { Page } from '@sveltejs/kit';
import { clsx, type ClassValue } from 'clsx';
import {
	getDay,
	previousDay,
	setMilliseconds,
	setSeconds,
	setMinutes,
	setHours,
	nextDay,
	subDays,
	type Day
} from 'date-fns';
import { tick } from 'svelte';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
type DateRangeOptions = {
	_fromDay?: Day;
	_fromTime?: string;
	_toDay?: Day;
	_toTime?: string; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	offset?: Date;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export type PeriodSelection = {
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

export function getDateRange(options?: DateRangeOptions) {
	const { _fromDay, _fromTime, _toDay, _toTime, offset } = options || {};
	const fromDay = (_fromDay || PUBLIC_FROM_DAY) as Day;
	const fromTime = (_fromTime || PUBLIC_FROM_TIME) as string;
	const toDay = (_toDay || PUBLIC_TO_DAY) as Day;
	const toTime = (_toTime || PUBLIC_TO_TIME) as string;

	const now = new TZDate(offset || new Date(), PUBLIC_TZ as string);
	const [fromHour, fromMinute] = fromTime.split(':').map(Number);

	const periodStart =
		getDay(now) == fromDay ? now : previousDay(now, fromDay, { in: tz(PUBLIC_TZ as string) });

	const startDate = setMilliseconds(
		setSeconds(setMinutes(setHours(periodStart, fromHour), fromMinute), 0),
		0
	);

	const [toHour, toMinute] = toTime.split(':').map(Number);

	// relative from start we get the next day
	const periodEndDate = nextDay(periodStart, toDay, {
		in: tz(PUBLIC_TZ as string)
	});
	const endDate = setMilliseconds(
		setSeconds(setMinutes(setHours(periodEndDate, toHour), toMinute), 0),
		0
	);

	const nextStart = nextDay(periodEndDate, fromDay, {
		in: tz(PUBLIC_TZ as string)
	});

	const nextStartDate = setMilliseconds(
		setSeconds(setMinutes(setHours(nextStart, fromHour), fromMinute), 0),
		0
	);

	// if its sunday we want to use the last Period to fetch items and display data?
	return {
		currentPeriod: {
			startDate,
			endDate,
			nextStartDate
		},
		isSunday: getDay(now) == 0,
		lastPeriod: {
			startDate: subDays(startDate, 7),
			endDate: subDays(endDate, 7),
			nextStartDate: subDays(nextStartDate, 7)
		}
	} as PeriodSelection;
}
export const getNowTZ = () => {
	return new TZDate(new Date(), PUBLIC_TZ as string);
};

export const setURLparams = async (
	page: Page<Record<string, string>, string | null>,
	selectedPeriod: PeriodSelection
) => {
	page.url.searchParams.set('period', selectedPeriod.currentPeriod.startDate.getTime().toString());
	await tick();
	replaceState(page.url, page.state);
};
