import store, { RootState } from "@/redux/store";
import { Roster } from "@/lib/types/userTypes";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import { getPositionMaxAge } from "@/utils/getPositionMaxAge";
import { getKtcTotValue } from "@/utils/getTeamKtcValues";

export const standingsColumnOptions = [
  { text: "Record", abbrev: "W/L" },
  { text: "Fantasy Points", abbrev: "Fp" },
  { text: "Avg Starter KTC Value", abbrev: "KTC S" },
  { text: "Avg Bench KTC Value", abbrev: "KTC B" },
  { text: "Avg Player KTC Value", abbrev: "KTC P" },
  { text: "Total Draft Pick KTC Value", abbrev: "KTC Pk" },
];

export const getStandingsColumnSort = (roster: Roster) => {
  const state: RootState = store.getState();

  const { ktc_current } = state.common;
  const { column1_standings, column2_standings, sortStandingsBy } =
    state.league;

  let sortbyCol;

  switch (sortStandingsBy.column) {
    case 1:
      sortbyCol = column1_standings;
      break;
    case 2:
      sortbyCol = column2_standings;
      break;
    default:
      break;
  }

  const starters = roster.starters_optimal || roster.starters;

  let sort;

  switch (sortbyCol) {
    case "W/L":
      sort = parseFloat(
        Math.round(
          (roster.wins / (roster.wins + roster.ties + roster.losses)) * 100
        ) +
          "." +
          roster.fp
      );

      break;
    case "Fp":
      sort = roster.fp;
      break;
    case "KTC S":
      sort =
        (ktc_current &&
          starters.length > 0 &&
          starters.reduce((acc, cur) => acc + (ktc_current[cur] || 0), 0) /
            starters.length) ||
        0;
      break;
    case "KTC B":
      sort =
        (ktc_current &&
          starters.length > 0 &&
          (roster.players || [])
            .filter((player_id) => !starters.includes(player_id))
            .reduce((acc, cur) => acc + (ktc_current[cur] || 0), 0) /
            starters.length) ||
        0;
      break;
    case "KTC P":
      sort =
        (ktc_current &&
          (roster.players || []).length > 0 &&
          Math.round(
            (roster.players || []).reduce(
              (acc, cur) => acc + (ktc_current[cur] || 0),
              0
            ) / (roster.players || []).length
          )) ||
        0;

      break;
    case "KTC Pk":
      sort = getKtcTotValue([], roster.draftpicks || []);

      break;

    default:
      sort = 0;
      break;
  }

  if (sortStandingsBy.asc) sort *= -1;

  return sort;
};

export const getStandingsColumn = (
  col: string,
  roster: Roster,
  rosters: Roster[]
) => {
  const state: RootState = store.getState();

  const { ktc_current } = state.common;

  const starters = roster.starters_optimal || roster.starters;
  const bench = (roster.players || []).filter(
    (player_id) => !starters.includes(player_id)
  );

  let text, trendColor, classname;

  switch (col) {
    case "W/L":
      text = `${roster.wins}-${roster.losses}${
        roster.ties ? `-${roster.ties}` : ""
      }`;

      trendColor = getTrendColor_Range(
        roster.wins / (roster.wins + roster.ties + roster.losses),
        0,
        1
      );
      classname = "record1";
      break;
    case "Fp":
      text = roster.fp.toLocaleString("en-US", { maximumFractionDigits: 0 });

      trendColor = getTrendColor_Range(
        roster.fp,
        Math.min(...rosters.map((r) => r.fp)),
        Math.max(...rosters.map((r) => r.fp))
      );
      classname = "fp";
      break;
    case "KTC S":
      text =
        (ktc_current &&
          starters.length > 0 &&
          Math.round(
            starters.reduce((acc, cur) => acc + (ktc_current[cur] || 0), 0) /
              starters.length
          ).toString()) ||
        "-";

      classname = "ktc";

      trendColor =
        parseInt(text) && getTrendColor_Range(parseInt(text), 1000, 8000);
      break;
    case "KTC B":
      text =
        (ktc_current &&
          bench.length > 0 &&
          Math.round(
            bench.reduce((acc, cur) => acc + (ktc_current[cur] || 0), 0) /
              bench.length
          ).toString()) ||
        "-";

      classname = "ktc";

      trendColor =
        parseInt(text) && getTrendColor_Range(parseInt(text), 1000, 8000);
      break;
    case "KTC P":
      text =
        (ktc_current &&
          (roster.players || []).length > 0 &&
          Math.round(
            (roster.players || []).reduce(
              (acc, cur) => acc + (ktc_current[cur] || 0),
              0
            ) / (roster.players || []).length
          ).toString()) ||
        "-";

      classname = "ktc";

      trendColor =
        parseInt(text) && getTrendColor_Range(parseInt(text), 1000, 8000);
      break;
    case "KTC Pk":
      text = getKtcTotValue([], roster.draftpicks || []).toLocaleString(
        "en-US"
      );

      classname = "ktc total";

      trendColor =
        parseInt(text) && getTrendColor_Range(parseInt(text), 1000, 8000);
      break;

    default:
      text = "-";
      trendColor = { color: `rgb(255, 255, 255)` };
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};

export const teamColumnOptions = [
  { text: "KTC", abbrev: "KTC" },
  { text: "Age", abbrev: "Age" },
];

export const getTeamColumn = (col: string, player_id: string) => {
  const state: RootState = store.getState();

  const { allplayers, ktc_current } = state.common;

  let text, trendColor, classname;

  switch (col) {
    case "KTC":
      text = (ktc_current && ktc_current[player_id]?.toString()) || "0";
      trendColor = getTrendColor_Range(
        ktc_current?.[player_id] || 0,
        1000,
        8000
      );
      classname = "ktc";
      break;
    case "Age":
      text = (allplayers && allplayers[player_id]?.age?.toString()) || "-";
      trendColor = getTrendColor_Range(
        parseInt(allplayers?.[player_id]?.age || "0"),
        21,
        getPositionMaxAge(allplayers?.[player_id]?.position),
        true
      );
      classname = "age";
      break;
    default:
      text = "-";
      trendColor = { color: `rgb(255, 255, 255)` };
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};
