import store, { RootState } from "@/redux/store";

export const getDraftPickId = (pick: {
  season: number | string;
  round: number;
  order?: number | null;
}) => {
  const state: RootState = store.getState();

  const { ktc_current } = state.common;

  if (
    pick.order &&
    Object.keys(ktc_current || {}).some((player_id) => player_id.includes("."))
  ) {
    return `${pick.season} ${pick.round}.${pick.order.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
    })}`;
  } else {
    if (pick.order && pick.order <= 4) {
      return `${pick.season} Early ${pick.round + getSuffix(pick.round)}`;
    } else if (pick.order && pick.order >= 9) {
      return `${pick.season} Late ${pick.round + getSuffix(pick.round)}`;
    } else {
      return `${pick.season} Mid ${pick.round + getSuffix(pick.round)}`;
    }
  }
};

const getSuffix = (round: number) => {
  switch (round) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};
