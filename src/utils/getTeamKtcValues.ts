import { Draftpick } from "@/lib/types/userTypes";
import store, { RootState } from "@/redux/store";
import { getDraftPickId } from "./getPickId";

export const getKtcAvgValue = (players: string[]) => {
  if (players.length === 0) return 0;

  const state: RootState = store.getState();

  const { ktc_current } = state.common;

  const total = players.reduce(
    (acc, cur) => acc + (ktc_current?.[cur] || 0),
    0
  );

  return Math.round(total / players.length);
};

export const getKtcTotValue = (players: string[], picks: Draftpick[]) => {
  if (players.length + picks.length === 0) return 0;

  const state: RootState = store.getState();

  const { ktc_current } = state.common;

  const players_total = players.reduce(
    (acc, cur) => acc + (ktc_current?.[cur] || 0),
    0
  );

  const picks_total = picks.reduce((acc, cur) => {
    const pick_id = getDraftPickId(cur);
    return acc + (ktc_current?.[pick_id] || ktc_current?.[pick_id] || 0);
  }, 0);

  return players_total + picks_total;
};
