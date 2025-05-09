import store, { RootState } from "@/redux/store";

export const getTotal = (
  players_array: string[] | undefined,
  players_points: { [key: string]: number } | undefined
) => {
  return (
    players_array?.reduce(
      (acc, cur) => acc + (players_points?.[cur] || 0),
      0
    ) || 0
  );
};

export const getMatchupsColumn = (col: string, league_id: string) => {
  const state: RootState = store.getState();

  const { matchups } = state.user;

  const user_matchup = matchups?.[league_id].user;
  const players_points = user_matchup?.players_points;

  const isOptimal = !(
    user_matchup?.starters?.some(
      (s) => !user_matchup.starters_optimal?.includes(s)
    ) ||
    user_matchup?.starters_optimal?.some(
      (s) => !user_matchup.starters?.includes(s)
    )
  );
  const delta =
    getTotal(user_matchup?.starters_optimal, players_points) -
    getTotal(user_matchup?.starters, players_points);

  let text, trendColor, classname;

  switch (col) {
    case "Opt-Act":
      text = isOptimal
        ? "\u2713"
        : delta.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
      classname = isOptimal ? "green" : "red";
      break;
    default:
      text = "-";
      classname = "";
      break;
  }

  return { text, trendColor, classname };
};
