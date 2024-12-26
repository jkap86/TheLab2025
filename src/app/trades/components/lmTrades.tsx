import { useSelector, useDispatch } from "react-redux";
import { useFetchLmTrades } from "@/hooks/useFetchLmTrades";
import { AppDispatch, RootState } from "@/redux/store";
import Trade from "./trade";
import { updateTradesState } from "../redux/tradesSlice";

const LmTrades = () => {
  const dispatch: AppDispatch = useDispatch();
  const { lmTrades } = useSelector((state: RootState) => state.user);
  const { activeTrade_lm } = useSelector((state: RootState) => state.trades);

  useFetchLmTrades();

  const setActiveTrade = (transaction_id: string) => {
    return dispatch(
      updateTradesState({ key: "activeTrade_lm", value: transaction_id })
    );
  };

  const table = (
    <table className="trades">
      {(lmTrades.trades || []).map((trade) => {
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

  return table;
};

export default LmTrades;
