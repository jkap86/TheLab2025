import Search from "@/components/search/search";
import Avatar from "@/components/avatar/avatar";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateTradesState } from "../redux/tradesSlice";
import { useCallback, useEffect } from "react";
import { updateState } from "@/redux/commonSlice";
import axios from "axios";
import Trade from "./trade";

const PcTrades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers, pcTrades } = useSelector(
    (state: RootState) => state.common
  );
  const { playershares, leaguemates } = useSelector(
    (state: RootState) => state.user
  );
  const { searched_player_pc, searched_manager_pc, page_pc, activeTrade_pc } =
    useSelector((state: RootState) => state.trades);

  const fetchPcTrades = useCallback(
    async (manager?: string, player?: string) => {
      try {
        dispatch(updateState({ key: "isLoadingPcTrades", value: true }));

        const pcTrades_raw = await axios.get("/api/pctrades", {
          params: {
            offset: 0,
            limit: 125,
            manager,
            player,
          },
        });

        dispatch(
          updateState({
            key: "pcTrades",
            value: [
              ...pcTrades.filter(
                (s) =>
                  !(
                    s.manager === searched_manager_pc &&
                    s.player === searched_player_pc
                  )
              ),
              {
                manager,
                player,
                count: parseInt(pcTrades_raw.data.count),
                trades: pcTrades_raw.data.rows,
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
    []
  );

  useEffect(() => {
    if (
      (searched_manager_pc || searched_player_pc) &&
      !pcTrades.some(
        (s) =>
          s.manager === searched_manager_pc && s.player === searched_player_pc
      )
    ) {
      fetchPcTrades(searched_manager_pc, searched_player_pc);
    }
  }, [searched_manager_pc, searched_player_pc, pcTrades, fetchPcTrades]);

  const tradesDisplay =
    pcTrades.find(
      (s) =>
        s.player === searched_player_pc && s.manager === searched_manager_pc
    )?.trades || [];

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
        {/*(tradesDisplay?.length || 0) < tradesCount ? (
         <li onClick={() => fetchMoreTrades()}>...</li>
       ) : null*/}
      </ol>
    </div>
  );

  const searches = (
    <div className="searches">
      <Search
        searched={
          allplayers?.[searched_player_pc]?.full_name || searched_player_pc
        }
        setSearched={(value) =>
          dispatch(updateTradesState({ key: "searched_player_pc", value }))
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
      {page_numbers}
      {table}
      {page_numbers}
    </>
  );
};

export default PcTrades;
