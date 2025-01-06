import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface LeagueState {
  column1_standings: string;
  column2_standings: string;
  sortStandingsBy: {
    column: 1 | 2;
    asc: boolean;
  };

  column1_team: string;
  column2_team: string;
}

const initialState: LeagueState = {
  column1_standings: "KTC S",
  column2_standings: "KTC B",
  column1_team: "KTC",
  column2_team: "Age",
  sortStandingsBy: {
    column: 1,
    asc: false,
  },
};

const leagueSlice = createSlice({
  name: "league",
  initialState,
  reducers: {
    updateLeagueState<K extends keyof LeagueState>(
      state: Draft<LeagueState>,
      action: PayloadAction<{ key: K; value: LeagueState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateLeagueState } = leagueSlice.actions;

export default leagueSlice.reducer;
