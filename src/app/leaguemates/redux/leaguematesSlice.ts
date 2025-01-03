import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface LeaguematesState {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  page: number;
  sortLeaguematesBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  searchedLeaguemate: string;
  activeLeaguemate: string;

  column1_lmLeagues: string;
  column2_lmLeagues: string;
  column3_lmLeagues: string;
  column4_lmLeagues: string;
  page_lmLeagues: number;
  sortLeaguemateLeaguesBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  activeLmLeague: string;
}

const initialState: LeaguematesState = {
  column1: "# Common",
  column2: "Fp",
  column3: "Fp Lm",
  column4: "KTC Picks",
  page: 1,
  sortLeaguematesBy: {
    column: 1,
    asc: false,
  },
  searchedLeaguemate: "",
  activeLeaguemate: "",

  column1_lmLeagues: "Rk",
  column2_lmLeagues: "Fp",
  column3_lmLeagues: "Lm Rk",
  column4_lmLeagues: "Lm Fp",
  page_lmLeagues: 1,
  sortLeaguemateLeaguesBy: {
    column: 0,
    asc: false,
  },
  activeLmLeague: "",
};

const leaguematesSlice = createSlice({
  name: "leaguemates",
  initialState,
  reducers: {
    updateLeaguematesState<K extends keyof LeaguematesState>(
      state: Draft<LeaguematesState>,
      action: PayloadAction<{ key: K; value: LeaguematesState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateLeaguematesState } = leaguematesSlice.actions;

export default leaguematesSlice.reducer;
