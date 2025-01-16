import { Trade } from "@/lib/types/userTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { updateState } from "@/redux/userSlice";
import { getOptimalStarters } from "@/utils/getOptimalStarters";
import { convertDraftPickId } from "@/utils/getPickId";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

export const useFetchLmTrades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { ktc_current } = useSelector((state: RootState) => state.common);
  const {
    leaguemates,
    lmTrades,
    lmTradeSearches,
    isLoadingLmTrades,
    errorLmTrades,
  } = useSelector((state: RootState) => state.user);
  const { searched_manager_lm, searched_player_lm } = useSelector(
    (state: RootState) => state.trades
  );

  const fetchLmTrades = useCallback(
    async (manager?: string, player?: string) => {
      try {
        dispatch(updateState({ key: "isLoadingLmTrades", value: true }));

        const lmTrades = await axios.post("/api/lmtrades", {
          leaguemate_ids: Object.keys(leaguemates),
          offset: 0,
          limit: 125,
          manager,
          player: player && convertDraftPickId(player),
        });

        if (manager || player) {
          dispatch(
            updateState({
              key: "lmTradeSearches",
              value: [
                ...lmTradeSearches.filter(
                  (s) =>
                    !(
                      s.manager === searched_manager_lm &&
                      s.player === searched_player_lm
                    )
                ),
                {
                  manager,
                  player,
                  count: parseInt(lmTrades.data.count),
                  trades: lmTrades.data.rows.map((trade: Trade) => {
                    return {
                      ...trade,
                      rosters: trade.rosters.map((r) => {
                        return {
                          ...r,
                          starters_optimal: getOptimalStarters(
                            trade.roster_positions,
                            r.players || [],
                            ktc_current
                          ),
                        };
                      }),
                    };
                  }),
                },
              ],
            })
          );
        } else {
          dispatch(
            updateState({
              key: "lmTrades",
              value: {
                count: parseInt(lmTrades.data.count),
                trades: lmTrades.data.rows.map((trade: Trade) => {
                  return {
                    ...trade,
                    rosters: trade.rosters.map((r) => {
                      return {
                        ...r,
                        starters_optimal: getOptimalStarters(
                          trade.roster_positions,
                          r.players || [],
                          ktc_current
                        ),
                      };
                    }),
                  };
                }),
              },
            })
          );
        }
      } catch (err: unknown) {
        console.log({ err });
        dispatch(
          updateState({ key: "errorLmTrades", value: "Error Fetching Trades" })
        );
      }
      dispatch(updateState({ key: "isLoadingLmTrades", value: false }));
    },
    [
      leaguemates,
      ktc_current,
      lmTradeSearches,
      searched_manager_lm,
      searched_player_lm,
      dispatch,
    ]
  );

  useEffect(() => {
    if (
      Object.keys(leaguemates).length > 0 &&
      !isLoadingLmTrades &&
      !errorLmTrades &&
      !lmTrades.trades
    ) {
      console.log({ lmTrades });
      fetchLmTrades();
    }
  }, [leaguemates, isLoadingLmTrades, errorLmTrades, lmTrades, fetchLmTrades]);

  useEffect(() => {
    if (
      (searched_manager_lm || searched_player_lm) &&
      !lmTradeSearches.some(
        (s) =>
          s.manager === searched_manager_lm && s.player === searched_player_lm
      )
    ) {
      fetchLmTrades(searched_manager_lm, searched_player_lm);
    }
  }, [searched_manager_lm, searched_player_lm, lmTradeSearches, fetchLmTrades]);
};
