import store, { RootState } from "@/redux/store";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { getPositionMaxAge } from "@/utils/getPositionMaxAge";
import { getTrendColor_Range } from "@/utils/getTrendColor";

export const columnOptions = [
  { text: "# Owned", abbrev: "# Own" },
  { text: "% Owned", abbrev: "% Own" },
  { text: "# Taken", abbrev: "# Taken" },
  { text: "# Available", abbrev: "# Avail" },
  { text: "Age", abbrev: "Age" },
  { text: "KTC Dynasty Value", abbrev: "KTC" },
  { text: "KTC 7 Day Trend", abbrev: "KTC 7" },
  { text: "KTC 30 Day Trend", abbrev: "KTC 30" },
  { text: "KTC Season Trend", abbrev: "KTC Szn" },
];

export const getPlayersSortValue = (player_id: string) => {
  const state: RootState = store.getState();

  const { allplayers, ktc_current } = state.common;
  const { playershares, leagues } = state.user;
  const { column1, column2, column3, column4, sortPlayersBy } = state.players;

  let sortbyCol;

  switch (sortPlayersBy.column) {
    case 1:
      sortbyCol = column1;
      break;
    case 2:
      sortbyCol = column2;
      break;
    case 3:
      sortbyCol = column3;
      break;
    case 4:
      sortbyCol = column4;
      break;
    default:
      break;
  }

  let sort;

  switch (sortbyCol) {
    case "# Own":
      sort = filterLeagueIds(playershares[player_id].owned).length;
      break;
    case "% Own":
      sort =
        (leagues &&
          filterLeagueIds(playershares[player_id].owned).length /
            filterLeagueIds(Object.keys(leagues)).length) ||
        0;
      break;
    case "KTC":
      sort = ktc_current?.[player_id] || 0;
      break;
    case "Age":
      sort = allplayers?.[player_id].age || 999;
      break;
    default:
      sort = allplayers?.[player_id].full_name || "";
      break;
  }
  return sort;
};

export const getPlayersColumn = (col: string, player_id: string) => {
  const state: RootState = store.getState();

  const { ktc_current, allplayers } = state.common;
  const { playershares, leagues } = state.user;

  const owned = filterLeagueIds(playershares[player_id].owned);

  let text, trendColor, classname;

  switch (col) {
    case "# Own":
      text = owned.length.toString();
      trendColor = getTrendColor_Range(
        owned.length / filterLeagueIds(Object.keys(leagues || {})).length,
        0,
        0.25
      );
      classname = "age";
      break;
    case "% Own":
      text =
        (leagues &&
          Math.round(
            (owned.length / filterLeagueIds(Object.keys(leagues)).length) * 100
          ) + "%") ||
        "-";
      trendColor = getTrendColor_Range(
        owned.length / filterLeagueIds(Object.keys(leagues || {})).length,
        0,
        0.25
      );
      classname = "ktc";
      break;
    case "Age":
      text = (allplayers && allplayers[player_id]?.age) || "-";
      trendColor = getTrendColor_Range(
        parseInt(allplayers?.[player_id]?.age || "0"),
        21,
        getPositionMaxAge(allplayers?.[player_id]?.position),
        true
      );
      classname = "age";
      break;
    case "KTC":
      text = ktc_current?.[player_id] || 0;
      trendColor = getTrendColor_Range(text, 1000, 8000);

      text = text.toString();
      classname = "ktc";
      break;
    default:
      text = "-";
      trendColor = { color: `rgb(255, 255, 255)` };
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};
