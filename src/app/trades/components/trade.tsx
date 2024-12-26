import Avatar from "@/components/avatar/avatar";
import { Trade as TradeType } from "@/lib/types/userTypes";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import TradeDetail from "./tradeDetail";

type setActiveTrade = (transaction_id: string) => void;

interface TradeProps {
  trade: TradeType;
  activeTrade: string;
  setActiveTrade: setActiveTrade;
}

const Trade = ({ trade, activeTrade, setActiveTrade }: TradeProps) => {
  const { allplayers } = useSelector((state: RootState) => state.common);

  return (
    <table
      className={
        "trade " + (activeTrade === trade.transaction_id ? "active-trade" : "")
      }
    >
      <tbody
        onClick={() =>
          setActiveTrade(
            activeTrade === trade.transaction_id ? "" : trade.transaction_id
          )
        }
        className={activeTrade === trade.transaction_id ? "active" : ""}
      >
        <tr>
          <td colSpan={6} className="timestamp">
            <div>
              {new Date(parseInt(trade.status_updated)).toLocaleDateString(
                "en-US"
              )}
            </div>
            <div>
              {new Date(parseInt(trade.status_updated)).toLocaleTimeString(
                "en-US"
              )}
            </div>
          </td>
          <td colSpan={12}>
            <Avatar id={trade.avatar} text={trade.name} type="L" />
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <div>
              {trade.settings.type === 2
                ? "Dynasty"
                : trade.settings.type === 1
                ? "Keeper"
                : "Redraft"}
            </div>
          </td>
          <td colSpan={3}>
            <div>{trade.settings.best_ball === 1 ? "Bestball" : "Lineup"}</div>
          </td>
          <td colSpan={3}>
            <div>
              Start {trade.roster_positions.filter((rp) => rp !== "BN").length}
            </div>
          </td>
          <td colSpan={4}>
            <div>
              {trade.roster_positions
                .filter((rp) => rp === "QB")
                .length.toString()}{" "}
              QB{" "}
              {trade.roster_positions
                .filter((rp) => rp === "SUPER_FLEX")
                .length.toString()}{" "}
              SF
            </div>
          </td>
          <td colSpan={5}>
            <div>
              {trade.roster_positions
                .filter((rp) => rp === "TE")
                .length.toString()}{" "}
              TE {trade.scoring_settings.bonus_rec_te || "0"}
              {"pt "}
              Prem
            </div>
          </td>
        </tr>
        {...trade.managers.map((user_id, index) => {
          const manager_roster = trade.rosters.find(
            (r) => r.user_id === user_id
          );

          return (
            <tr key={`${user_id}_${index}`}>
              <td colSpan={5}>
                <Avatar
                  id={manager_roster?.avatar || null}
                  type={"U"}
                  text={manager_roster?.username || "Orphan"}
                />
              </td>
              <td colSpan={7} className="adds">
                <table className="adds">
                  <tbody>
                    {Object.keys(trade.adds)
                      .filter(
                        (add) => trade.adds[add] === manager_roster?.user_id
                      )
                      .map((add, index) => {
                        return (
                          <tr key={`${add}_${index}`}>
                            <td
                              colSpan={2}
                              className={
                                trade.tips?.away.some(
                                  (tip) =>
                                    tip.player_id === add &&
                                    tip.leaguemate_id === trade.adds[add]
                                )
                                  ? "redb"
                                  : ""
                              }
                            >
                              <div>
                                {allplayers && allplayers[add]?.full_name}
                              </div>
                            </td>
                            <td></td>
                          </tr>
                        );
                      })}

                    {trade.draft_picks
                      .filter((dp) => dp.new === manager_roster?.user_id)
                      .map((dp) => {
                        return (
                          <tr
                            key={`${dp.season}_${dp.round}_${dp.original}_${index}`}
                          >
                            <td colSpan={2}>
                              {dp.order
                                ? `${dp.season} ${
                                    dp.round
                                  }.${dp.order.toLocaleString("en-US", {
                                    minimumIntegerDigits: 2,
                                  })}`
                                : `${dp.season} Round ${dp.round}`}
                            </td>
                            <td></td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </td>
              <td colSpan={6} className="drops">
                <table className="drops">
                  <tbody>
                    {Object.keys(trade.drops)
                      .filter(
                        (drops) =>
                          trade.drops[drops] === manager_roster?.user_id
                      )
                      .map((drop, index) => {
                        return (
                          <tr key={`${drop}_${index}`}>
                            <td
                              className={
                                trade.tips?.for?.some(
                                  (tip) =>
                                    tip.player_id === drop &&
                                    trade.drops[drop] === tip.leaguemate_id
                                )
                                  ? "greenb"
                                  : ""
                              }
                            >
                              <div>
                                {allplayers && allplayers[drop]?.full_name}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {trade.draft_picks
                      .filter((dp) => dp.old === manager_roster?.user_id)
                      .map((dp, index) => {
                        return (
                          <tr
                            key={`${dp.season}_${dp.round}_${dp.original}_${index}`}
                          >
                            <td>
                              <div>
                                {dp.order
                                  ? `${dp.season} ${
                                      dp.round
                                    }.${dp.order.toLocaleString("en-US", {
                                      minimumIntegerDigits: 2,
                                    })}`
                                  : `${dp.season} Round ${dp.round}`}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </td>
            </tr>
          );
        })}
      </tbody>
      {activeTrade === trade.transaction_id && (
        <tbody>
          <tr>
            <td colSpan={18}>
              <TradeDetail trade={trade} />
            </td>
          </tr>
        </tbody>
      )}
    </table>
  );
};

export default Trade;
