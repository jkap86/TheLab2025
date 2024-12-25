import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface MatchupsState {
  tab: "LC" | "S" | "L";

  column1_lc: string;
  column2_lc: string;
  column3_lc: string;
  column4_lc: string;
  page_lc: number;
  active_lc: string;
  column1_lcd: string;
  column2_lcd: string;
  column3_lcd: string;
  column4_lcd: string;
  active_lcd: string;

  column1_s: string;
  column2_s: string;
  column3_s: string;
  column4_s: string;
  page_s: number;
  active_s: string;

  column1_l: string;
  column2_l: string;
  column3_l: string;
  column4_l: string;
  page_l: number;
  active_l: string;
  column1_l_League: string;
  column2_l_League: string;
  column3_l_League: string;
  column4_l_League: string;
}

const initialState: MatchupsState = {
  tab: "LC",
  column1_lc: "Opt-Act",
  column2_lc: "Mv to FLX",
  column3_lc: "Mv frm FLX",
  column4_lc: "Proj Result",
  page_lc: 1,
  active_lc: "",
  column1_lcd: "Proj",
  column2_lcd: "Opp",
  column3_lcd: "Proj",
  column4_lcd: "Opp",
  active_lcd: "",

  column1_s: "Start",
  column2_s: "Bench",
  column3_s: "Opp Start",
  column4_s: "Opp Bench",
  page_s: 1,
  active_s: "",

  column1_l: "User Proj",
  column2_l: "User % Left",
  column3_l: "Opp Proj",
  column4_l: "Opp % Left",
  page_l: 1,
  active_l: "",
  column1_l_League: "Pts",
  column2_l_League: "Clock",
  column3_l_League: "Pts",
  column4_l_League: "Clock",
};

const matchupsSlice = createSlice({
  name: "matchups",
  initialState,
  reducers: {
    updateMatchupsState<K extends keyof MatchupsState>(
      state: Draft<MatchupsState>,
      action: PayloadAction<{ key: K; value: MatchupsState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateMatchupsState } = matchupsSlice.actions;

export default matchupsSlice.reducer;
