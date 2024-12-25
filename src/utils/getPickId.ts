import { Draftpick } from "@/lib/types/userTypes";
import store, { RootState } from "@/redux/store";

export const getDraftPickId = (pick: Draftpick) => {
  const state: RootState = store.getState();

  const { ktc_current } = state.common;

  if (
    pick.order &&
    Object.keys(ktc_current || {}).find((player_id) => player_id.includes("."))
  ) {
    return `${pick.season} ${pick.round}.${pick.order.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
    })}`;
  } else {
    return `${pick.season} Mid ${pick.round + getSuffix(pick.round)}`;
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
