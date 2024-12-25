import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface PlayersState {
  column1: string;
  column2: string;
  column3: string;
  column4: string;
  page: number;
  sortPlayersBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  searchedPlayer: string;
  activePlayer: string;

  playerLeaguesTab: string;

  column1_owned: string;
  column2_owned: string;
  column3_owned: string;
  column4_owned: string;
  page_owned: number;
  sortOwnedBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  searchedOwned: string;
  activeOwned: string;
}

const initialState: PlayersState = {
  column1: "# Own",
  column2: "KTC",
  column3: "KTC 7",
  column4: "KTC 30",
  page: 1,
  sortPlayersBy: {
    column: 1,
    asc: false,
  },
  searchedPlayer: "",
  activePlayer: "",

  playerLeaguesTab: "Owned",

  column1_owned: "Rank",
  column2_owned: "Pts Rank",
  column3_owned: "S KTC Rk",
  column4_owned: "T KTC Rk",
  page_owned: 1,
  sortOwnedBy: {
    column: 0,
    asc: false,
  },
  searchedOwned: "",
  activeOwned: "",
};

const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    updateState<K extends keyof PlayersState>(
      state: Draft<PlayersState>,
      action: PayloadAction<{ key: K; value: PlayersState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateState } = playersSlice.actions;

export default playersSlice.reducer;
