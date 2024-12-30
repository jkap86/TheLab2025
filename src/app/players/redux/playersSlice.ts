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
  trendDate: string;

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

  column1_taken: string;
  column2_taken: string;
  column3_taken: string;
  column4_taken: string;
  page_taken: number;
  sortTakenBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  searchedTaken: string;
  activeTaken: string;

  column1_available: string;
  column2_available: string;
  column3_available: string;
  column4_available: string;
  page_available: number;
  sortAvailableBy: {
    column: 0 | 1 | 2 | 3 | 4;
    asc: boolean;
  };
  searchedAvailable: string;
  activeAvailable: string;
}

const initialState: PlayersState = {
  column1: "# Own",
  column2: "% Own",
  column3: "KTC",
  column4: "Age",
  page: 1,
  sortPlayersBy: {
    column: 1,
    asc: false,
  },
  searchedPlayer: "",
  activePlayer: "",
  trendDate: "",

  playerLeaguesTab: "Owned",

  column1_owned: "Rk",
  column2_owned: "Pts Rk",
  column3_owned: "KTC S Rk",
  column4_owned: "KTC T Rk",
  page_owned: 1,
  sortOwnedBy: {
    column: 0,
    asc: false,
  },
  searchedOwned: "",
  activeOwned: "",

  column1_taken: "Rk",
  column2_taken: "Pts Rk",
  column3_taken: "KTC S Rk",
  column4_taken: "KTC T Rk",
  page_taken: 1,
  sortTakenBy: {
    column: 0,
    asc: false,
  },
  searchedTaken: "",
  activeTaken: "",

  column1_available: "Rk",
  column2_available: "Pts Rk",
  column3_available: "KTC S Rk",
  column4_available: "KTC T Rk",
  page_available: 1,
  sortAvailableBy: {
    column: 0,
    asc: false,
  },
  searchedAvailable: "",
  activeAvailable: "",
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
