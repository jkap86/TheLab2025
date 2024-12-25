import { Trade } from "@/lib/types/userTypes";
import { AppDispatch, RootState } from "@/redux/store";
import { updateState } from "@/redux/userSlice";
import { getOptimalStarters } from "@/utils/getOptimalStarters";
import axios from "axios";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

export const useFetchLmTrades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { ktc_current } = useSelector((state: RootState) => state.common);
  const { leaguemates, lmTrades, isLoadingLmTrades, errorLmTrades } =
    useSelector((state: RootState) => state.user);
  const { page_lm } = useSelector((state: RootState) => state.trades);

  useEffect(() => {
    const fetchLmTrades = async () => {
      try {
        dispatch(updateState({ key: "isLoadingLmTrades", value: true }));

        const lmTrades = await axios.post("/api/lmtrades", {
          leaguemate_ids: Object.keys(leaguemates),
          offset: 0,
          limit: 125,
        });

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
      } catch (err: any) {
        dispatch(
          updateState({ key: "errorLmTrades", value: "Error Fetching Trades" })
        );
      }
      dispatch(updateState({ key: "isLoadingLmTrades", value: false }));
    };

    if (
      Object.keys(leaguemates).length > 0 &&
      !isLoadingLmTrades &&
      !errorLmTrades &&
      !lmTrades.trades
    ) {
      console.log({ lmTrades });
      fetchLmTrades();
    }
  }, [leaguemates, isLoadingLmTrades, errorLmTrades, lmTrades, dispatch]);
};
