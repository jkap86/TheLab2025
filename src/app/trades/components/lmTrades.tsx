import { useSelector, useDispatch } from "react-redux";
import { useFetchLmTrades } from "@/hooks/useFetchLmTrades";
import { AppDispatch, RootState } from "@/redux/store";
import Trade from "./trade";
import { updateTradesState } from "../redux/tradesSlice";
import { updateState } from "@/redux/userSlice";
import axios from "axios";
import { Trade as TradeType } from "@/lib/types/userTypes";
import { getOptimalStarters } from "@/utils/getOptimalStarters";
import Search from "@/components/search/search";
import Avatar from "@/components/avatar/avatar";
import { useEffect } from "react";

const LmTrades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { ktc_current, allplayers } = useSelector(
    (state: RootState) => state.common
  );
  const { lmTrades, lmTradeSearches, leaguemates, playershares } = useSelector(
    (state: RootState) => state.user
  );
  const { activeTrade_lm, page_lm, searched_manager_lm, searched_player_lm } =
    useSelector((state: RootState) => state.trades);

  useFetchLmTrades();

  const fetchMoreTrades = async () => {
    const manager = searched_manager_lm;
    const player = searched_player_lm;
    dispatch(updateState({ key: "isLoadingLmTrades", value: true }));

    try {
      const moreTrades = await axios.post("/api/lmtrades", {
        leaguemate_ids: Object.keys(leaguemates),
        offset: lmTrades.trades?.length,
        limit: 125,
      });

      updatePage();
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
                count: parseInt(moreTrades.data.count),
                trades: moreTrades.data.rows.map((trade: TradeType) => {
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
              count: parseInt(moreTrades.data.count),
              trades: moreTrades.data.rows.map((trade: TradeType) => {
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
    } catch {
      dispatch(
        updateState({ key: "errorLmTrades", value: "Error Fetching Trades" })
      );
    }
    dispatch(updateState({ key: "isLoadingLmTrades", value: false }));
  };

  const setActiveTrade = (transaction_id: string) => {
    return dispatch(
      updateTradesState({ key: "activeTrade_lm", value: transaction_id })
    );
  };

  const updatePage = () => {
    const prevTradesLength = tradesDisplay.length;

    const newPage = Math.ceil((prevTradesLength - 1) / 25) + 1;

    console.log({ newPage });
    dispatch(updateTradesState({ key: "page_lm", value: newPage }));
  };

  const tradesDisplay =
    searched_manager_lm || searched_player_lm
      ? lmTradeSearches.find(
          (s) =>
            s.player === searched_player_lm && s.manager === searched_manager_lm
        )?.trades || []
      : lmTrades.trades || [];

  const tradesCount =
    searched_manager_lm || searched_player_lm
      ? lmTradeSearches.find((s) => s.player === searched_player_lm)?.count || 0
      : lmTrades.count || 0;

  useEffect(() => {
    dispatch(updateTradesState({ key: "page_lm", value: 1 }));
  }, [searched_player_lm, searched_manager_lm]);

  const table = (
    <table className="trades">
      {tradesDisplay
        .slice((page_lm - 1) * 25, (page_lm - 1) * 25 + 25)
        .map((trade) => {
          return (
            <tbody key={trade.transaction_id}>
              <tr>
                <td>
                  <Trade
                    trade={trade}
                    activeTrade={activeTrade_lm}
                    setActiveTrade={setActiveTrade}
                  />
                </td>
              </tr>
            </tbody>
          );
        })}
    </table>
  );

  const page_numbers = (
    <div className="page_numbers_wrapper">
      <ol className="page_numbers">
        {Array.from(
          Array(Math.ceil(tradesDisplay?.length / 25 || 0)).keys()
        ).map((key) => {
          return (
            <li
              key={key + 1}
              className={page_lm === key + 1 ? "active" : ""}
              onClick={() =>
                dispatch(updateTradesState({ key: "page_lm", value: key + 1 }))
              }
            >
              {key + 1}
            </li>
          );
        })}
        {(tradesDisplay?.length || 0) < tradesCount ? (
          <li onClick={() => fetchMoreTrades()}>...</li>
        ) : null}
      </ol>
    </div>
  );

  const searches = (
    <div className="searches">
      <Search
        searched={
          allplayers?.[searched_player_lm]?.full_name || searched_player_lm
        }
        setSearched={(value) =>
          dispatch(updateTradesState({ key: "searched_player_lm", value }))
        }
        options={Object.keys(playershares || {}).map((player_id) => {
          return {
            id: player_id,
            text: allplayers?.[player_id]?.full_name || player_id,
            display: (
              <Avatar
                id={player_id}
                text={allplayers?.[player_id]?.full_name || player_id}
                type="P"
              />
            ),
          };
        })}
        placeholder="Player"
      />
      <Search
        searched={
          leaguemates[searched_manager_lm]?.username || searched_manager_lm
        }
        setSearched={(value) =>
          dispatch(updateTradesState({ key: "searched_manager_lm", value }))
        }
        options={[
          ...Object.keys(leaguemates).map((lm_user_id) => {
            return {
              id: lm_user_id,
              text: leaguemates[lm_user_id].username,
              display: (
                <Avatar
                  id={leaguemates[lm_user_id].avatar}
                  text={leaguemates[lm_user_id].username}
                  type="U"
                />
              ),
            };
          }),
        ]}
        placeholder="Manager"
      />
    </div>
  );

  return (
    <>
      {searches}
      <h2>{tradesCount} Trades</h2>
      {page_numbers}
      {table}
      {page_numbers}
    </>
  );
};

export default LmTrades;
