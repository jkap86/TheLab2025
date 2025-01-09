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
  { text: "Ppr Ppg", abbrev: "Ppr Ppg" },
  { text: "# Games Played", abbrev: "# Gp" },
  { text: "Snap Percentage", abbrev: "Snp %" },
  { text: "KTC Dynasty Value", abbrev: "KTC" },
  { text: "KTC Trend", abbrev: "KTC T" },
  { text: "KTC Peak", abbrev: "KTC P" },
  { text: "KTC Peak Date", abbrev: "KTC PD" },
  { text: "KTC Low", abbrev: "KTC L" },
  { text: "KTC Low Date", abbrev: "KTC LD" },
];

export const getPlayersSortValue = (
  player_id: string,
  trendDate1: string,
  trendDate2: string,
  type: string
) => {
  const state: RootState = store.getState();

  const { allplayers, ktc_current, ktc_trend, ktc_peak, stats_trend } =
    state.common;
  const { playershares, pickshares, leagues } = state.user;
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
      sort =
        type === "player"
          ? filterLeagueIds(playershares[player_id].owned).length
          : filterLeagueIds(pickshares[player_id].owned).length;
      break;
    case "% Own":
      sort =
        (leagues &&
          filterLeagueIds(
            type === "player"
              ? playershares[player_id].owned
              : pickshares[player_id].owned
          ).length / filterLeagueIds(Object.keys(leagues)).length) ||
        0;
      break;
    case "KTC":
      sort = ktc_current?.[player_id] || 0;
      break;
    case "KTC T":
      sort =
        (ktc_trend.date1 === trendDate1 &&
          ktc_trend.date2 === trendDate2 &&
          (ktc_trend.values?.[player_id] || 0)) ||
        0;
      break;
    case "KTC P":
      sort =
        (ktc_peak.date1 === trendDate1 &&
          ktc_peak.date2 === trendDate2 &&
          ktc_peak.max_values[player_id]?.value) ||
        0;
      break;
    case "KTC PD":
      sort =
        (ktc_peak.date1 === trendDate1 &&
          ktc_peak.date2 === trendDate2 &&
          new Date(ktc_peak.max_values[player_id]?.date)) ||
        0;
      break;
    case "KTC L":
      sort =
        (ktc_peak.date1 === trendDate1 &&
          ktc_peak.date2 === trendDate2 &&
          ktc_peak.min_values[player_id]?.value) ||
        0;
      break;
    case "KTC LD":
      sort =
        (ktc_peak.date1 === trendDate1 &&
          ktc_peak.date2 === trendDate2 &&
          new Date(ktc_peak.min_values[player_id]?.date)) ||
        0;
      break;
    case "Ppr Ppg":
      sort =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? (stats_trend.values[player_id]?.pts_ppr || 0) /
            stats_trend.values[player_id].gp
          : 0;
      break;
    case "# Gp":
      sort = stats_trend.values[player_id]?.gp || 0;
      break;
    case "Snp %":
      sort =
        (stats_trend.values[player_id]?.tm_off_snp &&
          (stats_trend.values[player_id]?.off_snp || 0) /
            stats_trend.values[player_id].tm_off_snp) ||
        0;
      break;
    case "Age":
      sort = allplayers?.[player_id].age || 999;
      break;

    default:
      sort = allplayers?.[player_id].full_name || player_id;
      break;
  }
  return sort;
};

export const getPlayersColumn = (
  col: string,
  player_id: string,
  trendDate1: string,
  trendDate2: string,
  type: string
) => {
  const state: RootState = store.getState();

  const {
    ktc_current,
    ktc_trend,
    allplayers,
    ktc_peak,
    isLoadingKtcPeak,
    isLoadingKtcTrend,
    stats_trend,
    isLoadingStatsTrend,
  } = state.common;
  const { playershares, pickshares, leagues } = state.user;

  const owned =
    type === "player"
      ? filterLeagueIds(playershares[player_id].owned)
      : filterLeagueIds(pickshares[player_id].owned);

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
    case "KTC T":
      text = isLoadingKtcTrend
        ? "LOADING"
        : (ktc_trend.date1 === trendDate1 &&
            ktc_trend.date2 === trendDate2 &&
            (ktc_trend.values?.[player_id] || 0)) ||
          "-";
      trendColor = isLoadingKtcTrend
        ? { color: `rgb(100, 255, 255)` }
        : (typeof text === "number" && getTrendColor_Range(text, -500, 500)) ||
          {};
      text = text.toString();
      classname = "ktc";
      break;
    case "KTC P":
      text = isLoadingKtcPeak
        ? "LOADING"
        : (ktc_peak.date1 === trendDate1 &&
            ktc_peak.date2 === trendDate2 &&
            ktc_peak.max_values[player_id]?.value?.toString()) ||
          "-";
      trendColor = isLoadingKtcPeak
        ? { color: `rgb(100, 255, 255)` }
        : getTrendColor_Range(parseInt(text) || 0, 1000, 8000);
      classname = "ktc";
      break;
    case "KTC PD":
      text = isLoadingKtcPeak
        ? "LOADING"
        : (ktc_peak.date1 === trendDate1 &&
            ktc_peak.date2 === trendDate2 &&
            ktc_peak.max_values[player_id] &&
            new Date(ktc_peak.max_values[player_id]?.date).toLocaleDateString(
              "en-US",
              { year: "2-digit", month: "numeric", day: "numeric" }
            )) ||
          "-";
      trendColor = isLoadingKtcPeak ? { color: `rgb(100, 255, 255)` } : {};
      classname = "date";
      break;
    case "KTC L":
      text = isLoadingKtcPeak
        ? "LOADING"
        : (ktc_peak.date1 === trendDate1 &&
            ktc_peak.date2 === trendDate2 &&
            ktc_peak.min_values[player_id]?.value?.toString()) ||
          "-";
      trendColor = getTrendColor_Range(parseInt(text) || 0, 1000, 8000);
      classname = "ktc";
      break;
    case "KTC LD":
      text = isLoadingKtcPeak
        ? "LOADING"
        : (ktc_peak.date1 === trendDate1 &&
            ktc_peak.date2 === trendDate2 &&
            ktc_peak.min_values[player_id] &&
            new Date(ktc_peak.min_values[player_id]?.date).toLocaleDateString(
              "en-US",
              { year: "2-digit", month: "numeric", day: "numeric" }
            )) ||
          "-";
      trendColor = isLoadingKtcPeak ? { color: `rgb(100, 255, 255)` } : {};
      classname = "date";
      break;
    case "Ppr Ppg":
      text = isLoadingStatsTrend
        ? "LOADING"
        : stats_trend.date1 === trendDate1 &&
          stats_trend.date2 === trendDate2 &&
          stats_trend.values[player_id]?.gp > 0
        ? (
            (stats_trend.values[player_id].pts_ppr || 0) /
            stats_trend.values[player_id].gp
          ).toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })
        : "-";
      trendColor = isLoadingStatsTrend
        ? { color: `rgb(100, 255, 255)` }
        : getTrendColor_Range(parseInt(text), 5, 15);
      classname = "fp";
      break;
    case "# Gp":
      text = isLoadingStatsTrend
        ? "LOADING"
        : (
            (stats_trend.date1 === trendDate1 &&
              stats_trend.date2 === trendDate2 &&
              stats_trend.values[player_id]?.gp) ||
            0
          ).toLocaleString("en-US");
      trendColor = isLoadingStatsTrend ? { color: `rgb(100, 255, 255)` } : {};
      classname = "fp";
      break;
    case "Snp %":
      text = isLoadingStatsTrend
        ? "LOADING"
        : (stats_trend.values[player_id]?.tm_off_snp &&
            stats_trend.values[player_id].tm_off_snp > 0 &&
            ((stats_trend.values[player_id]?.off_snp || 0) /
              stats_trend.values[player_id].tm_off_snp) *
              100) ||
          false;
      trendColor =
        typeof text === "string"
          ? { color: `rgb(100, 255, 255)` }
          : (typeof text === "number" && getTrendColor_Range(text, 25, 75)) ||
            {};

      text =
        (text === "LOADING"
          ? (text && text) || "-"
          : typeof text === "number" &&
            text.toLocaleString("en-US", { maximumFractionDigits: 0 }) + "%") ||
        "-";
      classname = "percentage";
      break;
    default:
      text = "-";
      trendColor = { color: `rgb(255, 255, 255)` };
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};
