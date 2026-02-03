import type { TZDate } from '@date-fns/tz';

export type VoteStats = {
	totalGames: number;
	totalUsers: number;
	totalVotes: number;
	votesThisPeriod: number;
	votesToday: number;
};
export type WsVote = {
	game: {
		name: string;
		id: number;
	};
	user: { name: string; id: number };
};
export type TempVoteDate = {
	createdAt: TZDate;
	updatedAt: TZDate;
	id: string;
	voteText: string;
	updated?: boolean;
};
