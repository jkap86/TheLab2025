import store, { RootState } from "@/redux/store";

export const getLcDetailColumn = (
  col: string,
  league_id: string,
  player_id: string
) => {
  const state: RootState = store.getState();

  const { matchups, live_stats } = state.user;

  let text;
  const trendColor = {};
  const classname = "";

  switch (col) {
    case "Proj":
      text =
        matchups?.[league_id].user.players_points?.[player_id]?.toLocaleString(
          "en-US",
          { maximumFractionDigits: 1 }
        ) || "0";
      break;
    case "Opp":
      text = live_stats?.[league_id].players[player_id].opp.toString() || "0";
      break;
    default:
      text = "-";
      break;
  }

  return { text, trendColor, classname };
};
