"use client";

import Heading from "@/components/heading/heading";
import LeaguesProgress from "@/components/leaguesProgress/leaguesProgress";
import LoadingIcon from "@/components/loadingIcon/loadingIcon";
import { useFetchStateAndAllplayers } from "@/hooks/useFetchStateAllplayers";
import { useFetchUserAndLeagues } from "@/hooks/useFetchUserLeagues";
import { AppDispatch, RootState } from "@/redux/store";
import { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../trades.css";
import { updateTradesState } from "../redux/tradesSlice";
import LmTrades from "../components/lmTrades";
import PcTrades from "../components/pcTrades";

interface TradesProps {
  params: Promise<{ searched: string }>;
}

const Trades = ({ params }: TradesProps) => {
  const { searched } = use(params);
  const dispatch: AppDispatch = useDispatch();
  const {
    user,
    isLoadingUser,
    errorUser,
    leagues,
    isLoadingLeagues,
    errorLeagues,
    isLoadingLmTrades,
  } = useSelector((state: RootState) => state.user);
  const { tab } = useSelector((state: RootState) => state.trades);

  useFetchStateAndAllplayers();
  useFetchUserAndLeagues(searched);

  return (
    (errorUser && errorUser) || (
      <>
        {!user && !isLoadingUser && !errorUser ? (
          ""
        ) : isLoadingUser ? (
          <LoadingIcon message={"Loading User"} />
        ) : (
          errorUser || <Heading />
        )}
        {!leagues && !isLoadingLeagues && !errorLeagues ? (
          ""
        ) : isLoadingLeagues ? (
          <>
            <LeaguesProgress />
            <LoadingIcon message={"Loading Leagues"} />
          </>
        ) : (
          errorLeagues ||
          (isLoadingLmTrades ? (
            <LoadingIcon message={"Loading Trades"} />
          ) : (
            <>
              <div className="trade-nav-buttons">
                <div
                  className={tab === "Lm" ? "active" : ""}
                  onClick={() =>
                    dispatch(updateTradesState({ key: "tab", value: "Lm" }))
                  }
                >
                  Leaguemate
                </div>
                <div
                  className={tab === "Pc" ? "active" : ""}
                  onClick={() =>
                    dispatch(updateTradesState({ key: "tab", value: "Pc" }))
                  }
                >
                  Price Check
                </div>
              </div>
              {tab === "Lm" ? <LmTrades /> : tab === "Pc" ? <PcTrades /> : null}
            </>
          ))
        )}
      </>
    )
  );
};

export default Trades;
