import League from "@/components/league/league";
import { League as LeagueType, Trade } from "@/lib/types/userTypes";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

type TradeDetailProps = {
  trade: Trade;
};

const TradeDetail = ({ trade }: TradeDetailProps) => {
  const { tab_detail } = useSelector((state: RootState) => state.trades);

  const tradeLeague: LeagueType = {
    index: 0,
    league_id: trade.league_id,
    name: trade.name,
    avatar: trade.avatar,
    settings: trade.settings,
    scoring_settings: trade.scoring_settings,
    roster_positions: trade.roster_positions,
    rosters: trade.rosters,
    season: "2024",
    userRoster: trade.rosters[0],
    status: "",
  };

  const detail =
    tab_detail === "League" ? <League type={2} league={tradeLeague} /> : null;

  return (
    <>
      <div className="nav">
        {["Tips", "League"].map((text) => {
          return (
            <button key={text} className={tab_detail === text ? "active" : ""}>
              {text}
            </button>
          );
        })}
      </div>
      {detail}
    </>
  );
};

export default TradeDetail;
