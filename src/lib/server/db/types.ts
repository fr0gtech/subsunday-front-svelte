// src/lib/db/types.ts

import type { game } from './schema';
import type { InferSelectModel } from 'drizzle-orm';
// For selecting (fetching) data
export type Game = InferSelectModel<typeof game>;
