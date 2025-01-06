import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface LeaguesState {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  page: number;
  sortLeaguesBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  searchedLeague: string;
  activeLeague: string;
}

const initialState: LeaguesState = {
  column1: "KTC S Avg",
  column2: "KTC B Avg",
  column3: "KTC S Rk",
  column4: "KTC T Rk",
  page: 1,
  sortLeaguesBy: {
    column: 0,
    asc: false,
  },
  searchedLeague: "",
  activeLeague: "",
};

const leaguesSlice = createSlice({
  name: "leagues",
  initialState,
  reducers: {
    updateLeaguesState<K extends keyof LeaguesState>(
      state: Draft<LeaguesState>,
      action: PayloadAction<{ key: K; value: LeaguesState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateLeaguesState } = leaguesSlice.actions;

export default leaguesSlice.reducer;
