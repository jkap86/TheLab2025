import store, { RootState } from "@/redux/store";
import { filterLeagueIds } from "@/utils/filterLeagues";

export const starterColumnOptions = [
  { text: "Start", abbrev: "Start" },
  { text: "Bench", abbrev: "Bench" },
  { text: "Opp Start", abbrev: "Opp Start" },
  { text: "Opp Bench", abbrev: "Opp Bench" },
  { text: "Start P", abbrev: "Start P" },
  { text: "Bench P", abbrev: "Bench P" },
  { text: "Opp Start P", abbrev: "Opp Start P" },
  { text: "Opp Bench P", abbrev: "Opp Bench P" },
  { text: "Ppr Fp", abbrev: "Ppr Fp" },
];

export const getStartersSortValue = (
  player_obj: {
    user: { start: string[]; bench: string[] };
    opp: { start: string[]; bench: string[] };
  },
  player_id: string
) => {
  const state: RootState = store.getState();

  const { allplayers } = state.common;
  const { players_live_obj } = state.user;
  const { sortStartersBy, column1_s, column2_s, column3_s, column4_s } =
    state.matchups;

  let sortbyCol;

  switch (sortStartersBy.column) {
    case 1:
      sortbyCol = column1_s;
      break;
    case 2:
      sortbyCol = column2_s;
      break;
    case 3:
      sortbyCol = column3_s;
      break;
    case 4:
      sortbyCol = column4_s;
      break;
    default:
      break;
  }

  let sort;

  switch (sortbyCol) {
    case "Start":
      sort = filterLeagueIds(player_obj.user?.start || []).length;
      break;
    case "Bench":
      sort = filterLeagueIds(player_obj.user?.bench || []).length;
      break;
    case "Opp Start":
      sort = filterLeagueIds(player_obj.opp?.start || []).length;
      break;
    case "Opp Bench":
      sort = filterLeagueIds(player_obj.opp?.bench || []).length;
      break;
    case "Start P":
      sort = filterLeagueIds(player_obj.user?.start || [], true).length;
      break;
    case "Bench P":
      sort = filterLeagueIds(player_obj.user?.bench || [], true).length;
      break;
    case "Opp Start P":
      sort = filterLeagueIds(player_obj.opp?.start || [], true).length;
      break;
    case "Opp Bench P":
      sort = filterLeagueIds(player_obj.opp?.bench || [], true).length;
      break;
    case "Ppr Fp":
      sort = players_live_obj[player_id]?.stats_obj?.pts_ppr || 0;

      break;
    default:
      return allplayers?.[player_id].full_name || "";
  }

  if (sortStartersBy.asc) sort *= -1;
  return sort;
};

export const getStartersColumn = (
  col: string,
  player_id: string,
  player_obj: {
    user: { start: string[]; bench: string[] };
    opp: { start: string[]; bench: string[] };
  }
) => {
  const state: RootState = store.getState();

  const { players_live_obj } = state.user;

  let text, trendColor, classname;

  switch (col) {
    case "Start":
      text = filterLeagueIds(player_obj.user?.start || []).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Bench":
      text = filterLeagueIds(player_obj.user?.bench || []).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Opp Start":
      text = filterLeagueIds(player_obj.opp?.start || []).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Opp Bench":
      text = filterLeagueIds(player_obj.opp?.bench || []).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Start P":
      text = filterLeagueIds(
        player_obj.user?.start || [],
        true
      ).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Bench P":
      text = filterLeagueIds(
        player_obj.user?.bench || [],
        true
      ).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Opp Start P":
      text = filterLeagueIds(
        player_obj.opp?.start || [],
        true
      ).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Opp Bench P":
      text = filterLeagueIds(
        player_obj.opp?.bench || [],
        true
      ).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Ppr Fp":
      text = (players_live_obj[player_id]?.stats_obj?.pts_ppr || 0).toString();
      trendColor = {};
      classname = "";
      break;
    default:
      text = "-";
      trendColor = {};
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};
