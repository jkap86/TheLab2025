import Search from "@/components/search/search";
import Avatar from "@/components/avatar/avatar";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateTradesState } from "../redux/tradesSlice";
import { useCallback, useEffect } from "react";
import { updateState } from "@/redux/commonSlice";
import axios from "axios";
import Trade from "./trade";
import { Trade as TradeType } from "@/lib/types/userTypes";
import { getOptimalStarters } from "@/utils/getOptimalStarters";
import { convertDraftPickId } from "@/utils/getPickId";

const PcTrades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers, pcTrades, ktc_current } = useSelector(
    (state: RootState) => state.common
  );
  const { playershares, pickshares } = useSelector(
    (state: RootState) => state.user
  );
  const { searched_player1_pc, searched_player2_pc, page_pc, activeTrade_pc } =
    useSelector((state: RootState) => state.trades);

  const fetchPcTrades = useCallback(
    async (player1?: string, player2?: string) => {
      try {
        dispatch(updateState({ key: "isLoadingPcTrades", value: true }));

        const pcTrades_raw = await axios.get("/api/pctrades", {
          params: {
            offset: 0,
            limit: 125,
            player1: player1 && convertDraftPickId(player1),
            player2: player2 && convertDraftPickId(player2),
          },
        });

        dispatch(
          updateState({
            key: "pcTrades",
            value: [
              ...pcTrades.filter(
                (s) =>
                  !(
                    s.player1 === searched_player1_pc &&
                    s.player2 === searched_player2_pc
                  )
              ),
              {
                player1: searched_player1_pc,
                player2: searched_player2_pc,
                count: parseInt(pcTrades_raw.data.count),
                trades: pcTrades_raw.data.rows.map((trade: TradeType) => {
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
      } catch (err: unknown) {
        console.log({ err });
        dispatch(
          updateState({ key: "errorPcTrades", value: "Error Fetching Trades" })
        );
      }
      dispatch(updateState({ key: "isLoadingPcTrades", value: false }));
    },
    [pcTrades, searched_player1_pc, searched_player2_pc, ktc_current, dispatch]
  );

  const fetchMoreTrades = async () => {
    const player1 = searched_player1_pc;
    const player2 = searched_player2_pc;

    dispatch(updateState({ key: "isLoadingPcTrades", value: true }));

    try {
      const moreTrades = await axios.get("/api/pctrades", {
        params: {
          player1: player1 && convertDraftPickId(player1),
          player2: player2 && convertDraftPickId(player2),
          offset: (
            pcTrades.find(
              (s) =>
                s.player1 === searched_player1_pc &&
                s.player2 === searched_player2_pc
            )?.trades || []
          ).length,
          limit: 125,
        },
      });
      updatePage();
      dispatch(
        updateState({
          key: "pcTrades",
          value: [
            ...pcTrades.filter(
              (s) =>
                !(
                  s.player1 === searched_player1_pc &&
                  s.player2 === searched_player2_pc
                )
            ),
            {
              player1,
              player2,
              count: parseInt(moreTrades.data.count),
              trades: [
                ...(pcTrades.find(
                  (s) =>
                    s.player1 === searched_player1_pc &&
                    s.player2 === searched_player2_pc
                )?.trades || []),
                ...moreTrades.data.rows.map((trade: TradeType) => {
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
              ],
            },
          ],
        })
      );
    } catch {
      dispatch(
        updateState({ key: "errorPcTrades", value: "Error Fetching Trades" })
      );
    }
    dispatch(updateState({ key: "isLoadingPcTrades", value: false }));
  };

  const updatePage = () => {
    const prevTradesLength = (
      pcTrades.find(
        (s) =>
          s.player1 === searched_player1_pc && s.player2 === searched_player2_pc
      )?.trades || []
    ).length;

    const newPage = Math.ceil((prevTradesLength - 1) / 25) + 1;

    console.log({ newPage });
    dispatch(updateTradesState({ key: "page_pc", value: newPage }));
  };

  useEffect(() => {
    if (
      (searched_player1_pc || searched_player2_pc) &&
      !pcTrades.some(
        (s) =>
          s.player1 === searched_player1_pc && s.player2 === searched_player2_pc
      )
    ) {
      fetchPcTrades(searched_player1_pc, searched_player2_pc);
    }
  }, [searched_player1_pc, searched_player2_pc, pcTrades, fetchPcTrades]);

  const tradesDisplay =
    pcTrades.find(
      (s) =>
        s.player1 === searched_player1_pc && s.player2 === searched_player2_pc
    )?.trades || [];

  const tradesCount = pcTrades.find(
    (s) =>
      s.player1 === searched_player1_pc && s.player2 === searched_player2_pc
  )?.count;

  useEffect(() => {
    dispatch(updateTradesState({ key: "page_pc", value: 1 }));
  }, [searched_player1_pc, searched_player2_pc, dispatch]);

  const page_numbers = (
    <div className="page_numbers_wrapper">
      <ol className="page_numbers">
        {Array.from(
          Array(Math.ceil(tradesDisplay?.length / 25 || 0)).keys()
        ).map((key) => {
          return (
            <li
              key={key + 1}
              className={page_pc === key + 1 ? "active" : ""}
              onClick={() =>
                dispatch(updateTradesState({ key: "page_pc", value: key + 1 }))
              }
            >
              {key + 1}
            </li>
          );
        })}
        {tradesDisplay?.length > 25 &&
        tradesCount &&
        (tradesDisplay?.length || 0) < (tradesCount || 0) ? (
          <li onClick={() => fetchMoreTrades()}>...</li>
        ) : null}
      </ol>
    </div>
  );

  const player_pick_options = [
    ...Object.keys(playershares || {}).map((player_id) => {
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
    }),
    ...Object.keys(pickshares || {}).map((pick_id) => {
      let pick_name = pick_id;

      if (pick_name.includes("null")) {
        const pick_array = pick_id.split(" ");
        const season = pick_array[0];
        const round = pick_array[1].split(".")[0];
        pick_name = `${season} Round ${round}`;
      }
      return {
        id: pick_name,
        text: pick_name,
        display: <>{pick_name}</>,
      };
    }),
  ];

  const searches = (
    <div className="searches">
      <Search
        searched={
          allplayers?.[searched_player1_pc]?.full_name || searched_player1_pc
        }
        setSearched={(value) =>
          dispatch(updateTradesState({ key: "searched_player1_pc", value }))
        }
        options={player_pick_options}
        placeholder="Player"
      />
      {searched_player1_pc ? (
        <Search
          searched={
            allplayers?.[searched_player2_pc]?.full_name || searched_player2_pc
          }
          setSearched={(value) =>
            dispatch(updateTradesState({ key: "searched_player2_pc", value }))
          }
          options={player_pick_options.filter(
            (o) => o.id !== searched_player1_pc
          )}
          placeholder="Player 2"
        />
      ) : null}
    </div>
  );

  const setActiveTrade = (transaction_id: string) => {
    return dispatch(
      updateTradesState({ key: "activeTrade_pc", value: transaction_id })
    );
  };

  const table = (
    <table className="trades">
      {tradesDisplay
        .slice((page_pc - 1) * 25, (page_pc - 1) * 25 + 25)
        .map((trade) => {
          return (
            <tbody key={trade.transaction_id}>
              <tr>
                <td>
                  <Trade
                    trade={trade}
                    activeTrade={activeTrade_pc}
                    setActiveTrade={setActiveTrade}
                  />
                </td>
              </tr>
            </tbody>
          );
        })}
    </table>
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

export default PcTrades;
