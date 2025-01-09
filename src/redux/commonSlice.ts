import { Allplayer } from "@/lib/types/commonTypes";
import { PlayerProjection, Trade } from "@/lib/types/userTypes";
import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";

export interface CommonState {
  state: { [key: string]: string | number } | null;
  allplayers: { [player_id: string]: Allplayer } | null;
  ktc_current: { [player_id: string]: number } | null;

  isLoadingKtcTrend: boolean;
  ktc_trend: {
    date1: string;
    date2: string;
    values: { [player_id: string]: number };
  };

  isLoadingKtcPeak: boolean;
  ktc_peak: {
    date1: string;
    date2: string;
    min_values: { [player_id: string]: { date: string; value: number } };
    max_values: { [player_id: string]: { date: string; value: number } };
  };
  projections_week: { [player_id: string]: PlayerProjection } | null;

  isLoadingStatsTrend: boolean;
  stats_trend: {
    date1: string;
    date2: string;
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
  ktc_trend: { date1: "", date2: "", values: {} },

  isLoadingKtcPeak: false,
  ktc_peak: { date1: "", date2: "", max_values: {}, min_values: {} },

  projections_week: null,

  isLoadingStatsTrend: false,
  stats_trend: {
    date1: "",
    date2: "",
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
