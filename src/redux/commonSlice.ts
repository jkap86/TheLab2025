import { Allplayer } from "@/lib/types/commonTypes";
import { PlayerProjection } from "@/lib/types/userTypes";
import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";

export interface CommonState {
  state: { [key: string]: string | number } | null;
  allplayers: { [player_id: string]: Allplayer } | null;
  ktc_current: { [player_id: string]: number } | null;
  ktc_previous: { date: string; values: { [player_id: string]: number } };
  ktc_peak: {
    date: string;
    min_values: { [player_id: string]: { date: string; value: number } };
    max_values: { [player_id: string]: { date: string; value: number } };
  };
  projections_week: { [player_id: string]: PlayerProjection } | null;

  type1: "Redraft" | "All" | "Dynasty";
  type2: "Bestball" | "All" | "Lineup";
}

const initialState: CommonState = {
  state: null,
  allplayers: null,
  ktc_current: null,
  ktc_previous: { date: "", values: {} },
  ktc_peak: { date: "", max_values: {}, min_values: {} },
  projections_week: null,

  type1: "All",
  type2: "All",
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    updateState<K extends keyof CommonState>(
      state: Draft<CommonState>,
      action: PayloadAction<{ key: K; value: CommonState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { updateState } = commonSlice.actions;

export default commonSlice.reducer;
