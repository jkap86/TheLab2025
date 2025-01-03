import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "./store";
import { getOptimalStarters } from "@/utils/getOptimalStarters";
import { League, Matchup, Roster } from "@/lib/types/userTypes";
import { getPlayerTotal } from "@/utils/getPlayerStatProjTotal";

export const syncLeague = createAsyncThunk(
  "syncLeague",
  async (
    {
      league_id,
      roster_id,
      season,
      week,
    }: {
      league_id: string;
      roster_id: number;
      season: string;
      week: number;
    },
    { getState }
  ) => {
    const state = getState() as RootState;
    const { ktc_current } = state.common;
    const { leagues } = state.user;

    const response = await axios.get("/api/syncleague", {
      params: {
        league_id,
        roster_id,
        season,
        week,
      },
    });

    return {
      ...(leagues?.[league_id] || {}),
      ...response.data,
      rosters: response.data.rosters.map((r: Roster) => {
        return {
          ...r,
          starters_optimal: getOptimalStarters(
            response.data.roster_positions,
            r.players || [],
            ktc_current
          ),
          userRoster: {
            ...response.data.userRoster,
            starters_optimal: getOptimalStarters(
              response.data.roster_positions,
              response.data.userRoster.players || [],
              ktc_current
            ),
          },
        };
      }),
    };
  }
);

export const fetchMatchups = createAsyncThunk(
  "fetchMatchups",
  async (_, { getState }) => {
    const rootState = getState() as RootState;

    const { state, projections_week } = rootState.common;
    const { leagues } = rootState.user;

    const response: { data: Matchup[] } = await axios.post("/api/matchups", {
      league_ids: Object.keys(leagues as { [league_id: string]: League }),
      week: state && state.week,
    });

    const matchup_league_ids = Array.from(
      new Set(response.data.map((matchup) => matchup.league_id))
    );

    const matchups_obj: {
      [league_id: string]: {
        user: Matchup;
        opp: Matchup;
        league: Matchup[];
      };
    } = {};

    matchup_league_ids.forEach((league_id) => {
      const league_matchups = response.data
        .filter((matchup) => matchup.league_id === league_id)
        .map((matchup) => {
          const values_obj: { [player_id: string]: number } = {};

          matchup.players.forEach((player_id) => {
            values_obj[player_id] = getPlayerTotal(
              leagues?.[league_id]?.scoring_settings || {},
              projections_week?.[player_id]?.stats || {}
            );
          });

          const starters_optimal =
            (leagues &&
              getOptimalStarters(
                leagues[league_id].roster_positions,
                matchup.players,
                values_obj
              )) ||
            [];

          return {
            ...matchup,
            starters: leagues?.[league_id].settings.best_ball
              ? starters_optimal
              : matchup.starters,
            starters_optimal: starters_optimal,
            players_points: values_obj,
          };
        });

      const user_matchup = league_matchups.find(
        (matchup) =>
          matchup.roster_id === leagues?.[league_id].userRoster?.roster_id
      );

      const opp_matchup = league_matchups.find(
        (matchup) =>
          matchup.matchup_id === user_matchup?.matchup_id &&
          matchup.roster_id !== user_matchup?.roster_id
      );

      if (user_matchup && opp_matchup) {
        matchups_obj[league_id] = {
          user: user_matchup,
          opp: opp_matchup,
          league: league_matchups,
        };
      }
    });

    return matchups_obj;
  }
);

export const syncMatchup = createAsyncThunk(
  "syncMatchup",
  async (
    {
      league_id,
      week,
      playoff_week_start,
    }: {
      league_id: string;
      week: number;
      playoff_week_start: number;
    },
    { getState }
  ) => {
    const state = getState() as RootState;

    const { projections_week } = state.common;
    const { leagues, matchups } = state.user;

    const response: { data: Matchup[] } = await axios.get("/api/syncmatchup", {
      params: {
        league_id,
        week,
        playoff_week_start,
      },
    });

    const league_matchups = response.data.map((matchup) => {
      const values_obj: { [player_id: string]: number } = {};

      matchup.players.forEach((player_id) => {
        values_obj[player_id] = getPlayerTotal(
          leagues?.[league_id]?.scoring_settings || {},
          projections_week?.[player_id]?.stats || {}
        );
      });

      const starters_optimal =
        (leagues &&
          getOptimalStarters(
            leagues[league_id].roster_positions,
            matchup.players,
            values_obj
          )) ||
        [];

      return {
        ...matchup,
        starters: leagues?.[league_id].settings.best_ball
          ? starters_optimal
          : matchup.starters,
        starters_optimal: starters_optimal,
        players_points: values_obj,
      };
    });

    console.log({ league_matchups });

    const user_matchup = league_matchups.find(
      (matchup) =>
        matchup.roster_id === leagues?.[league_id].userRoster.roster_id
    );

    const opp_matchup = league_matchups.find(
      (matchup) =>
        matchup.matchup_id === user_matchup?.matchup_id &&
        matchup.roster_id !== user_matchup?.roster_id
    );

    console.log({
      league_id,
      roster_id: user_matchup?.roster_id,
      u: leagues?.[league_id].userRoster.roster_id,
    });

    if (user_matchup && opp_matchup) {
      console.log("UPDATE MATCHUP");
      return {
        ...matchups,
        [league_id]: {
          user: user_matchup,
          opp: opp_matchup,
          league: league_matchups,
        },
      };
    } else {
      console.log("NO USER OR OPP MATCHUP");
      return matchups;
    }
  }
);
