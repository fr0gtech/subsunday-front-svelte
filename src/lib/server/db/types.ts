// src/lib/db/types.ts

import type { game, subSundayMoment, user, vote } from './schema';
import type { InferSelectModel } from 'drizzle-orm';

// For selecting (fetching) data
export type Game = InferSelectModel<typeof game>;
export type User = InferSelectModel<typeof user>;
export type Vote = InferSelectModel<typeof vote>;
export type Moment = InferSelectModel<typeof subSundayMoment>;

export type GamePrice = {
	final: number;
	initial: number;
	currency: string;
	final_formatted: string;
	discount_percent: number;
	initial_formatted: string;
};

export type GameCategories = {
	id: number;
	description: string;
};
