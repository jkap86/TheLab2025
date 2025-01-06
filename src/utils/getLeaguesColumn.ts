import { League } from "@/lib/types/userTypes";
import store, { RootState } from "@/redux/store";
import { getTrendColor_Range } from "./getTrendColor";
import { getKtcAvgValue, getKtcTotValue } from "./getTeamKtcValues";

export const leaguesColumnOptions = [
  { text: "Rank", abbrev: "Rk" },
  { text: "Points Rank", abbrev: "Pts Rk" },
  { text: "KTC Starter Value Rank", abbrev: "KTC S Rk" },
  { text: "KTC Bench Value Rank", abbrev: "KTC B Rk" },
  { text: "KTC Total Value Rank", abbrev: "KTC T Rk" },
  { text: "KTC Draft Picks Value Rank", abbrev: "KTC Pk Rk" },
  { text: "KTC Starter Average Value", abbrev: "KTC S Avg" },
  { text: "KTC Bench Average Value", abbrev: "KTC S Avg" },
  { text: "Trade Deadline", abbrev: "Trade D" },
];

export const getLeaguesColumnSortValue = (
  league: League,
  sortby: { column: number; asc: boolean },
  columns: string[]
) => {
  const sortbyCol = columns[sortby.column - 1];

  let sortValue;

  switch (sortbyCol) {
    case "Rk":
      sortValue =
        [...league.rosters]
          .sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.fp - a.fp)
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      break;
    case "Pts Rk":
      sortValue =
        [...league.rosters]
          .sort((a, b) => b.fp - a.fp)
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      break;
    case "KTC S Rk":
      sortValue =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcAvgValue(b.starters_optimal || []) -
              getKtcAvgValue(a.starters_optimal || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      break;
    case "KTC T Rk":
      sortValue =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcTotValue(b.players || [], b.draftpicks || []) -
              getKtcTotValue(a.players || [], a.draftpicks || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      break;
    case "KTC S Avg":
      sortValue = -getKtcAvgValue(league.userRoster.starters_optimal || []);

      break;
    case "KTC B Avg":
      sortValue = -getKtcAvgValue(
        (league.userRoster.players || []).filter(
          (player_id) =>
            !league.userRoster.starters_optimal?.includes(player_id)
        )
      );

      break;

    case "KTC Pk Rk":
      sortValue =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcTotValue([], b.draftpicks || []) -
              getKtcTotValue([], a.draftpicks || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      break;

    case "Trade D":
      sortValue = league.settings.disable_trades
        ? 0
        : -league.settings.trade_deadline;
      break;

    default:
      if (sortby.asc) {
        return league.name;
      } else {
        return league.index;
      }
  }

  if (sortby.asc) sortValue *= -1;

  return sortValue;
};

export const getLeaguesColumn = (col: string, league: League) => {
  const rootState: RootState = store.getState();

  const { state } = rootState.common;

  let text, trendColor, classname;

  switch (col) {
    case "Rk":
      text =
        [...league.rosters]
          .sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.fp - a.fp)
          .findIndex((r) => {
            return r.roster_id === league.userRoster.roster_id;
          }) + 1;

      trendColor = getTrendColor_Range(
        text,
        1,
        league.rosters.length + 1,
        true
      );

      text = text.toString();

      classname = "rank";
      break;
    case "Pts Rk":
      text =
        [...league.rosters]
          .sort((a, b) => b.fp - a.fp)
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      trendColor = getTrendColor_Range(
        text,
        1,
        league.rosters.length + 1,
        true
      );

      text = text.toString();
      classname = "rank";
      break;
    case "KTC S Rk":
      text =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcAvgValue(b.starters_optimal || []) -
              getKtcAvgValue(a.starters_optimal || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      trendColor = getTrendColor_Range(
        text,
        1,
        league.rosters.length + 1,
        true
      );

      text = text.toString();
      classname = "rank";
      break;
    case "KTC T Rk":
      text =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcTotValue(b.players || [], b.draftpicks || []) -
              getKtcTotValue(a.players || [], a.draftpicks || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      trendColor = getTrendColor_Range(
        text,
        1,
        league.rosters.length + 1,
        true
      );
      text = text.toString();

      classname = "rank";
      break;
    case "KTC S Avg":
      text = getKtcAvgValue(league.userRoster.starters_optimal || []);

      trendColor = getTrendColor_Range(text, 1000, 8000);
      classname = "ktc";

      text = text.toString();
      break;
    case "KTC B Avg":
      text = getKtcAvgValue(
        (league.userRoster.players || []).filter(
          (player_id) =>
            !league.userRoster.starters_optimal?.includes(player_id)
        )
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      classname = "ktc";

      text = text.toString();
      break;

    case "KTC Pk Rk":
      text =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcTotValue([], b.draftpicks || []) -
              getKtcTotValue([], a.draftpicks || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      trendColor = getTrendColor_Range(
        text,
        1,
        league.rosters.length + 1,
        true
      );

      text = text.toString();
      classname = "rank";
      break;
    case "Trade D":
      text = league.settings.disable_trades
        ? "-"
        : league.settings.trade_deadline === 99
        ? "\u221E"
        : league.settings.trade_deadline;

      classname =
        (state?.season_type === "regular" && typeof state?.week === "number"
          ? league.settings.trade_deadline < state?.week ||
            league.settings.disable_trades
            ? "red"
            : league.settings.trade_deadline >= state?.week
            ? "green"
            : ""
          : "") + (league.settings.trade_deadline === 99 ? " infinity" : "");

      text = text.toString();
      break;
    default:
      text = "-";
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};
