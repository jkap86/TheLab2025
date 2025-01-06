import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface TradesState {
  tab: "Lm" | "Pc";

  page_lm: number;
  activeTrade_lm: string;
  searched_manager_lm: string;
  searched_player_lm: string;

  page_pc: number;
  activeTrade_pc: string;
  searched_manager_pc: string;
  searched_player_pc: string;

  tab_detail: "Tips" | "League";
}

const initialState: TradesState = {
  tab: "Lm",

  page_lm: 1,
  activeTrade_lm: "",
  searched_manager_lm: "",
  searched_player_lm: "",

  page_pc: 1,
  activeTrade_pc: "",
  searched_manager_pc: "",
  searched_player_pc: "",

  tab_detail: "League",
};

const tradesSlice = createSlice({
  name: "trades",
  initialState,
  reducers: {
    updateTradesState<K extends keyof TradesState>(
      state: Draft<TradesState>,
      action: PayloadAction<{ key: K; value: TradesState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateTradesState } = tradesSlice.actions;

export default tradesSlice.reducer;
