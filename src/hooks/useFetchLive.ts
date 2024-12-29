import { AppDispatch, RootState } from "@/redux/store";
import { updateState } from "@/redux/userSlice";
import { getOptimalStarters } from "@/utils/getOptimalStarters";
import { getPlayerTotal } from "@/utils/getPlayerStatProjTotal";
import axios from "axios";
import { useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

export const useFetchLive = () => {
  const dispatch: AppDispatch = useDispatch();
  const { state, projections_week } = useSelector(
    (state: RootState) => state.common
  );
  const { matchups, leagues, live_stats } = useSelector(
    (state: RootState) => state.user
  );
  const initialRenderRef = useRef(false);

  const fetchLive = useCallback(async () => {
    if (state && projections_week && matchups && leagues) {
      console.log(`FETCHING`);
      const live: {
        data: {
          opp: string;
          player_id: string;
          quarter_num: number;
          team: string;
          time_remaining: string;
          percent_game_remaining: number;
          proj_obj: { [cat: string]: number };
          stats_obj: { [cat: string]: number };
        }[];
      } = await axios.get("/api/livestats", {
        params: {
          week: state.week,
        },
      });

      const players_live_obj = Object.fromEntries(
        live.data.map((l) => [l.player_id, l])
      );

      const leagues_live_obj: {
        [league_id: string]: {
          user_pts: number;
          user_proj: number;
          user_pct_left: number;
          opp_pts: number;
          opp_proj: number;
          opp_pct_left: number;
          players: {
            [player_id: string]: {
              opp: string;
              clock: string;
              pts: number;
              proj: number;
              pct_left: number;
            };
          };
          starters_optimal_user?: string[];
          starters_optimal_opp?: string[];
        };
      } = {};

      Object.keys(matchups).forEach((league_id) => {
        const league = leagues[league_id];
        const matchups_obj = matchups[league_id];
        let user_starters_pts,
          user_starters_proj,
          opp_starters_pts,
          opp_starters_proj;

        if (league.settings.best_ball) {
          user_starters_pts = getOptimalStarters(
            league.roster_positions,
            matchups_obj.user.players,
            Object.fromEntries(
              Object.keys(players_live_obj).map((player_id) => [
                player_id,
                getPlayerTotal(
                  league.scoring_settings,
                  players_live_obj[player_id].stats_obj
                ),
              ])
            )
          );

          user_starters_proj = getOptimalStarters(
            league.roster_positions,
            matchups_obj.user.players,
            Object.fromEntries(
              Object.keys(players_live_obj).map((player_id) => [
                player_id,
                getPlayerTotal(
                  league.scoring_settings,
                  players_live_obj[player_id].proj_obj
                ),
              ])
            )
          );

          opp_starters_pts = getOptimalStarters(
            league.roster_positions,
            matchups_obj.opp.players,
            Object.fromEntries(
              Object.keys(players_live_obj).map((player_id) => [
                player_id,
                getPlayerTotal(
                  league.scoring_settings,
                  players_live_obj[player_id].stats_obj
                ),
              ])
            )
          );

          opp_starters_proj = getOptimalStarters(
            league.roster_positions,
            matchups_obj.opp.players,
            Object.fromEntries(
              Object.keys(players_live_obj).map((player_id) => [
                player_id,
                getPlayerTotal(
                  league.scoring_settings,
                  players_live_obj[player_id].proj_obj
                ),
              ])
            )
          );
        } else {
          user_starters_pts = matchups_obj.user.starters;
          user_starters_proj = matchups_obj.user.starters;
          opp_starters_pts = matchups_obj.opp.starters;
          opp_starters_proj = matchups_obj.opp.starters;
        }

        const user_pts = user_starters_pts?.reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              players_live_obj[cur]?.stats_obj || {}
            ),
          0
        );

        const user_proj = user_starters_proj?.reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              players_live_obj[cur]?.proj_obj || {}
            ),
          0
        );

        const opp_pts = opp_starters_pts?.reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              players_live_obj[cur]?.stats_obj || {}
            ),
          0
        );

        const opp_proj = opp_starters_proj?.reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              players_live_obj[cur]?.proj_obj || {}
            ),
          0
        );

        const user_pct_left = Math.round(
          (matchups_obj.user.starters?.reduce(
            (acc, cur) =>
              acc + (players_live_obj[cur]?.percent_game_remaining || 0),
            0
          ) /
            matchups_obj.user.starters?.length) *
            100
        );

        const opp_pct_left = Math.round(
          (matchups_obj.opp.starters?.reduce(
            (acc, cur) =>
              acc + (players_live_obj[cur]?.percent_game_remaining || 0),
            0
          ) /
            matchups_obj.opp.starters?.length) *
            100
        );

        leagues_live_obj[league_id] = {
          user_pts,
          user_proj,
          opp_pts,
          opp_proj,
          user_pct_left,
          opp_pct_left,
          players: Object.fromEntries(
            [...matchups_obj.user.players, ...matchups_obj.opp.players].map(
              (player_id) => [
                player_id,
                {
                  opp: players_live_obj[player_id]?.opp,
                  clock: `Q${players_live_obj[player_id]?.quarter_num}  ${players_live_obj[player_id]?.time_remaining}`,
                  pts: getPlayerTotal(
                    leagues?.[league_id]?.scoring_settings || {},
                    players_live_obj[player_id]?.stats_obj || {}
                  ),
                  proj: getPlayerTotal(
                    leagues?.[league_id]?.scoring_settings || {},
                    players_live_obj[player_id]?.proj_obj || {}
                  ),
                  pct_left: players_live_obj[player_id]?.percent_game_remaining,
                },
              ]
            )
          ),
          starters_optimal_user: user_starters_proj,
          starters_optimal_opp: opp_starters_proj,
        };
      });

      dispatch(updateState({ key: "live_stats", value: leagues_live_obj }));
      dispatch(
        updateState({ key: "players_live_obj", value: players_live_obj })
      );
    }
  }, [state, projections_week, matchups, leagues, dispatch]);

  useEffect(() => {
    if (!initialRenderRef.current || !live_stats) {
      console.log("1 ---" + new Date());
      fetchLive();
      initialRenderRef.current = true;
    }
  }, [fetchLive, initialRenderRef, live_stats]);

  useEffect(() => {
    const live = Object.values(live_stats || {}).some((league_obj) => {
      return Object.values(league_obj.players).some((player_obj) => {
        return player_obj.pct_left > 0 && player_obj.pct_left < 1;
      });
    });

    if (live) {
      const timeout = setTimeout(() => {
        console.log("2 ---" + new Date());
        fetchLive();
      }, 60000);

      return () => clearTimeout(timeout);
    }
  }, [live_stats, fetchLive]);
};
