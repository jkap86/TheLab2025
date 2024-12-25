import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface TradesState {
  tab: "Lm" | "Pc";

  page_lm: number;
  activeTrade_lm: string;

  page_pc: number;
  activeTrade_pc: string;

  tab_detail: "Tips" | "League";
}

const initialState: TradesState = {
  tab: "Lm",

  page_lm: 1,
  activeTrade_lm: "",

  page_pc: 1,
  activeTrade_pc: "",

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
