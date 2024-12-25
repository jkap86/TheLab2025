import { getOptimalStarters } from "@/utils/getOptimalStarters";
import { getPlayerTotal } from "@/utils/getPlayerStatProjTotal";
import store, { RootState } from "@/redux/store";
import { League, Matchup } from "@/lib/types/userTypes";

export const columnOptionsLive = [
  { text: "User Projection", abbrev: "User Proj" },
  { text: "User Points", abbrev: "User Pts" },
  { text: "Opponent Projection", abbrev: "Opp Proj" },
  { text: "Opponent Points", abbrev: "Opp Pts" },
  { text: "User % of Game Left", abbrev: "User % Left" },
  { text: "Opp % of Game Left", abbrev: "Opp % Left" },
];

export const getLiveColumn = (col: string, league_id: string) => {
  const state: RootState = store.getState();

  const { live_stats } = state.user;
  /*
  let user_starters_pts,
    user_starters_proj,
    opp_starters_pts,
    opp_starters_proj;
  
  if (league.settings.best_ball) {
    user_starters_pts = getOptimalStarters(
      league.roster_positions,
      matchups_obj.user.players,
      Object.fromEntries(
        Object.keys(live_stats).map((player_id) => [
          player_id,
          getPlayerTotal(
            league.scoring_settings,
            live_stats[player_id].stats_obj
          ),
        ])
      )
    );

    user_starters_proj = getOptimalStarters(
      league.roster_positions,
      matchups_obj.user.players,
      Object.fromEntries(
        Object.keys(live_stats).map((player_id) => [
          player_id,
          getPlayerTotal(
            league.scoring_settings,
            live_stats[player_id].proj_obj
          ),
        ])
      )
    );

    opp_starters_pts = getOptimalStarters(
      league.roster_positions,
      matchups_obj.opp.players,
      Object.fromEntries(
        Object.keys(live_stats).map((player_id) => [
          player_id,
          getPlayerTotal(
            league.scoring_settings,
            live_stats[player_id].stats_obj
          ),
        ])
      )
    );

    opp_starters_proj = getOptimalStarters(
      league.roster_positions,
      matchups_obj.opp.players,
      Object.fromEntries(
        Object.keys(live_stats).map((player_id) => [
          player_id,
          getPlayerTotal(
            league.scoring_settings,
            live_stats[player_id].proj_obj
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

  let text, trendColor, classname;

  switch (col) {
    
    case "User Pts":
      text = user_starters_pts
        ?.reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              live_stats[cur]?.stats_obj || {}
            ),
          0
        )
        .toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
      break;
    case "User Proj":
      text = user_starters_proj
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              live_stats[cur]?.proj_obj || {}
            ),
          0
        )
        .toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
      break;
    case "Opp Pts":
      text = opp_starters_pts
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              live_stats[cur]?.stats_obj || {}
            ),
          0
        )
        .toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
      break;
    case "Opp Proj":
      text = opp_starters_proj
        .reduce(
          (acc, cur) =>
            acc +
            getPlayerTotal(
              league.scoring_settings,
              live_stats[cur]?.proj_obj || {}
            ),
          0
        )
        .toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
      break;
    case "User % Left":
      text =
        Math.round(
          (matchups_obj.user.starters.reduce(
            (acc, cur) => acc + (live_stats[cur]?.percent_game_remaining || 0),
            0
          ) /
            matchups_obj.user.starters.length) *
            100
        ) + "%";
      break;
    case "Opp % Left":
      text =
        Math.round(
          (matchups_obj.opp.starters.reduce(
            (acc, cur) => acc + (live_stats[cur]?.percent_game_remaining || 0),
            0
          ) /
            matchups_obj.opp.starters.length) *
            100
        ) + "%";
      break;
    
    default:
      text = "-";
      break;
  }
  */

  let text, trendColor, classname;

  switch (col) {
    case "User Pts":
      text = live_stats[league_id]?.user_pts?.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      });
      break;
    case "User Proj":
      text = live_stats[league_id]?.user_proj?.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      });
      break;
    case "User % Left":
      text = live_stats[league_id]?.user_pct_left + "%";
      break;
    case "Opp Pts":
      text = live_stats[league_id]?.opp_pts?.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      });
      break;
    case "Opp Proj":
      text = live_stats[league_id]?.opp_proj?.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      });
      break;
    case "Opp % Left":
      text = live_stats[league_id]?.opp_pct_left + "%";
      break;
    default:
      text = "-";
      break;
  }

  return { text, trendColor, classname };
};

export const columnOptionsLiveDetail = [
  {
    text: "Points",
    abbrev: "Pts",
  },
  {
    text: "Clock",
    abbrev: "Clock",
  },
  {
    text: "Projection",
    abbrev: "Proj",
  },
];

export const getLiveDetailColumn = (
  col: string,
  league_id: string,
  player_id: string
) => {
  const state: RootState = store.getState();

  const { live_stats } = state.user;

  let text, trendColor, classname;

  switch (col) {
    case "Clock":
      text = live_stats[league_id].players[player_id]?.clock;
      break;
    case "Pts":
      text = live_stats[league_id].players[player_id]?.pts?.toLocaleString(
        "en-US",
        { maximumFractionDigits: 1 }
      );
      break;
    case "Proj":
      text = live_stats[league_id].players[player_id]?.proj?.toLocaleString(
        "en-US",
        { maximumFractionDigits: 1 }
      );
      break;
    default:
      text = "-";
      break;
  }

  return { text, trendColor, classname };
};
