import { combineReducers } from "@reduxjs/toolkit";
import commonReducer from "./commonSlice";
import userReducer from "./userSlice";
import playersReducer from "../app/players/redux/playersSlice";
import leagueReducer from "../components/league/redux/leagueSlice";
import leaguesReducer from "../app/leagues/redux/leaguesSlice";
import leaguematesReducer from "../app/leaguemates/redux/leaguematesSlice";
import tradesReducer from "../app/trades/redux/tradesSlice";
import matchupsReducer from "../app/matchups/redux/matchupsSlice";

const rootReducer = combineReducers({
  common: commonReducer,
  user: userReducer,
  players: playersReducer,
  league: leagueReducer,
  leagues: leaguesReducer,
  leaguemates: leaguematesReducer,
  trades: tradesReducer,
  matchups: matchupsReducer,
});

export default rootReducer;
