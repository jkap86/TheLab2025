import { Leaguemate } from "@/lib/types/userTypes";
import store, { RootState } from "@/redux/store";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { getKtcAvgValue } from "@/utils/getTeamKtcValues";
import { getTrendColor_Range } from "@/utils/getTrendColor";

export const leaguematesColumnOptions = [
  { text: "# of Common Leagues", abbrev: "# Common" },
  { text: "Fantasy Points", abbrev: "Fp" },
  { text: "Leaguemate Fantasy Points", abbrev: "Fp Lm" },
  { text: "Avg Team KTC Starter Value", abbrev: "KTC S" },
  { text: "Avg Team KTC Starter Value - Leaguemate", abbrev: "KTC S Lm" },
  { text: "Avg Team KTC QB Value", abbrev: "KTC QB" },
  { text: "Avg Team KTC QB Value - Leaguemate", abbrev: "KTC QB Lm" },

  { text: "Avg Team KTC RB Value", abbrev: "KTC RB" },
  { text: "Avg Team KTC RB Value - Leaguemate", abbrev: "KTC RB Lm" },

  { text: "Avg Team KTC WR Value", abbrev: "KTC WR" },
  { text: "Avg Team KTC WR Value - Leaguemate", abbrev: "KTC WR Lm" },

  { text: "Avg Team KTC TE Value", abbrev: "KTC TE" },
  { text: "Avg Team KTC TE Value - Leaguemate", abbrev: "KTC TE Lm" },
];

export const getLeaguematesSortby = (lm: Leaguemate) => {
  const state: RootState = store.getState();

  const { sortLeaguematesBy, column1, column2, column3, column4 } =
    state.leaguemates;

  let sortbyCol;

  switch (sortLeaguematesBy.column) {
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
    case "# Common":
      sort = filterLeagueIds(lm.leagues).length;
      break;
    default:
      sort = lm.username;
      break;
  }

  return sort;
};

export const getLeaguematesColumn = (col: string, lm: Leaguemate) => {
  const state: RootState = store.getState();

  const { allplayers } = state.common;
  const { leagues } = state.user;

  let text, trendColor, classname;

  switch (col) {
    case "# Common":
      text = filterLeagueIds(lm.leagues).length.toString();
      trendColor = {};
      classname = "";
      break;
    case "Fp":
      text =
        (leagues &&
          Math.round(
            filterLeagueIds(lm.leagues).reduce(
              (acc, cur) => acc + leagues[cur].userRoster.fp,
              0
            )
          ).toLocaleString("en-US")) ||
        "-";
      trendColor = {};
      classname = "";
      break;
    case "Fp Lm":
      text =
        (leagues &&
          Math.round(
            filterLeagueIds(lm.leagues).reduce((acc, cur) => {
              const lm_roster = leagues[cur].rosters.find(
                (r) => r.user_id === lm.user_id
              );

              return acc + (lm_roster?.fp || 0);
            }, 0)
          ).toLocaleString("en-US")) ||
        "-";
      trendColor = {};
      classname = "";
      break;
    case "KTC S":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          return (
            acc +
            getKtcAvgValue(leagues?.[cur].userRoster.starters_optimal || [])
          );
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";
      break;
    case "KTC S Lm":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          const lmStarters =
            leagues?.[cur]?.rosters.find((r) => r.user_id === lm.user_id)
              ?.starters_optimal || [];
          return acc + getKtcAvgValue(lmStarters);
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";

      break;
    case "KTC QB":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          return (
            acc +
            getKtcAvgValue(
              leagues?.[cur].userRoster.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "QB"
              ) || []
            )
          );
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";
      break;
    case "KTC QB Lm":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          const lmQBs =
            leagues?.[cur]?.rosters
              .find((r) => r.user_id === lm.user_id)
              ?.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "QB"
              ) || [];
          return acc + getKtcAvgValue(lmQBs);
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";

      break;

    case "KTC RB":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          return (
            acc +
            getKtcAvgValue(
              leagues?.[cur].userRoster.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "RB"
              ) || []
            )
          );
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";
      break;
    case "KTC RB Lm":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          const lmRBs =
            leagues?.[cur]?.rosters
              .find((r) => r.user_id === lm.user_id)
              ?.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "RB"
              ) || [];
          return acc + getKtcAvgValue(lmRBs);
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";

      break;

    case "KTC WR":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          return (
            acc +
            getKtcAvgValue(
              leagues?.[cur].userRoster.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "WR"
              ) || []
            )
          );
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";
      break;
    case "KTC WR Lm":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          const lmWRs =
            leagues?.[cur]?.rosters
              .find((r) => r.user_id === lm.user_id)
              ?.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "WR"
              ) || [];
          return acc + getKtcAvgValue(lmWRs);
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";

      break;

    case "KTC TE":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          return (
            acc +
            getKtcAvgValue(
              leagues?.[cur].userRoster.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "TE"
              ) || []
            )
          );
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";
      break;
    case "KTC TE Lm":
      text = Math.round(
        filterLeagueIds(lm.leagues).reduce((acc, cur) => {
          const lmTEs =
            leagues?.[cur]?.rosters
              .find((r) => r.user_id === lm.user_id)
              ?.players?.filter(
                (player_id) => allplayers?.[player_id]?.position === "TE"
              ) || [];
          return acc + getKtcAvgValue(lmTEs);
        }, 0) / filterLeagueIds(lm.leagues).length
      );

      trendColor = getTrendColor_Range(text, 1000, 8000);
      text = text.toString();
      classname = "ktc";

      break;

    default:
      text = "-";
      trendColor = {};
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};
