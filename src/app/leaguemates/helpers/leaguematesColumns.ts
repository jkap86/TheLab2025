import { Leaguemate } from "@/lib/types/userTypes";
import store, { RootState } from "@/redux/store";
import { filterLeagueIds } from "@/utils/filterLeagues";

export const getLeaguematesColumn = (col: string, lm: Leaguemate) => {
  const state: RootState = store.getState();

  const { leagues } = state.user;

  let text, trendColor;

  switch (col) {
    case "# Common":
      text = filterLeagueIds(lm.leagues).length.toString();
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
      break;
    default:
      text = "-";
      break;
  }

  return { text, trendColor };
};
