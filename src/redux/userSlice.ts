import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";
import {
  League,
  Leaguemate,
  Matchup,
  Playershare,
  Trade,
  User,
} from "@/lib/types/userTypes";
import { fetchMatchups, syncLeague, syncMatchup } from "./userActions";

export interface UserState {
  user: User | null;
  isLoadingUser: boolean;
  errorUser: string | null;

  leagues: { [league_id: string]: League } | null;
  isLoadingLeagues: boolean;
  errorLeagues: string | null;
  leaguesProgress: number;

  isSyncingLeague: false | string;
  errorSyncingLeague: string | null;

  playershares: {
    [league_id: string]: Playershare;
  };
  leaguemates: {
    [lm_user_id: string]: Leaguemate;
  };

  isLoadingLmTrades: boolean;
  lmTrades: {
    count: number;
    trades: Trade[] | null;
  };
  errorLmTrades: string | null;

  isLoadingMatchups: boolean;
  matchups: {
    [league_id: string]: {
      user: Matchup;
      opp: Matchup;
      league: Matchup[];
    };
  } | null;
  errorMatchups: string | null;
  isSyncingMatchup: false | string;
  errorSyncingMatchup: string | null;

  live_stats: {
    [league_id: string]: {
      user_pts: number;
      user_proj: number;
      user_pct_left: number;
      opp_pts: number;
      opp_proj: number;
      opp_pct_left: number;
      players: {
        [player_id: string]: {
          opp: string;
          clock: string;
          pts: number;
          proj: number;
          pct_left: number;
        };
      };
    };
  };
}

const initialState: UserState = {
  user: null,
  isLoadingUser: false,
  errorUser: null,

  leagues: null,
  isLoadingLeagues: false,
  errorLeagues: null,
  leaguesProgress: 0,

  isSyncingLeague: false,
  errorSyncingLeague: null,

  playershares: {},
  leaguemates: {},

  isLoadingLmTrades: false,
  lmTrades: {
    count: 0,
    trades: null,
  },
  errorLmTrades: null,

  isLoadingMatchups: false,
  matchups: null,
  errorMatchups: null,
  isSyncingMatchup: false,
  errorSyncingMatchup: null,

  live_stats: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateState<K extends keyof UserState>(
      state: Draft<UserState>,
      action: PayloadAction<{ key: K; value: UserState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncLeague.pending, (state, action) => {
        state.isSyncingLeague = action.meta.arg.league_id;
        state.errorSyncingLeague = null;
      })
      .addCase(syncLeague.fulfilled, (state, action) => {
        state.isSyncingLeague = false;
        state.leagues = {
          ...state.leagues,
          [action.payload.league_id]: action.payload,
        };
      })
      .addCase(syncLeague.rejected, (state, action) => {
        state.isSyncingLeague = false;
        state.errorSyncingLeague =
          action.error.message || "Error Syncing League";
      });

    builder
      .addCase(fetchMatchups.pending, (state) => {
        state.isLoadingMatchups = true;
        state.errorMatchups = null;
      })
      .addCase(fetchMatchups.fulfilled, (state, action) => {
        state.isLoadingMatchups = false;
        state.matchups = action.payload;
      })
      .addCase(fetchMatchups.rejected, (state, action) => {
        state.isLoadingMatchups = false;
        state.errorMatchups = action.error.message || "Error fetching matchups";
      });

    builder
      .addCase(syncMatchup.pending, (state, action) => {
        state.isSyncingMatchup = action.meta.arg.league_id;
        state.errorSyncingMatchup = null;
      })
      .addCase(syncMatchup.fulfilled, (state, action) => {
        state.isSyncingMatchup = false;
        state.matchups = action.payload;
      })
      .addCase(syncMatchup.rejected, (state, action) => {
        state.isSyncingMatchup = false;
        state.errorSyncingMatchup =
          action.error.message || "Error Syncing Matchup";
      });
  },
});

export const { updateState, resetState } = userSlice.actions;

export default userSlice.reducer;
