import { Allplayer } from "@/lib/types/commonTypes";
import { PlayerProjection, Trade } from "@/lib/types/userTypes";
import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";

export interface CommonState {
  state: { [key: string]: string | number } | null;
  allplayers: { [player_id: string]: Allplayer } | null;
  ktc_current: { [player_id: string]: number } | null;

  isLoadingKtcTrend: boolean;
  ktc_trend: {
    date: string;
    days: number;
    values: { [player_id: string]: number };
  };

  isLoadingKtcPeak: boolean;
  ktc_peak: {
    date: string;
    days: number;
    min_values: { [player_id: string]: { date: string; value: number } };
    max_values: { [player_id: string]: { date: string; value: number } };
  };
  projections_week: { [player_id: string]: PlayerProjection } | null;

  isLoadingStatsTrend: boolean;
  stats_trend: {
    date: string;
    days: number;
    season_type: string;
    values: { [player_id: string]: { [cat: string]: number } };
  };

  isLoadingPcTrades: boolean;
  pcTrades: {
    player1: string | undefined;
    player2: string | undefined;
    count: number;
    trades: Trade[];
  }[];
  errorPcTrades: string | null;

  type1: "Redraft" | "All" | "Dynasty";
  type2: "Bestball" | "All" | "Lineup";
}

const initialState: CommonState = {
  state: null,
  allplayers: null,
  ktc_current: null,

  isLoadingKtcTrend: false,
  ktc_trend: { date: "", days: 0, values: {} },

  isLoadingKtcPeak: false,
  ktc_peak: { date: "", days: 0, max_values: {}, min_values: {} },

  projections_week: null,

  isLoadingStatsTrend: false,
  stats_trend: {
    date: "",
    days: 0,
    season_type: "",
    values: {},
  },

  isLoadingPcTrades: false,
  pcTrades: [],
  errorPcTrades: null,

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
