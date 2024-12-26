"use client";

import LoadCommonData from "@/components/loadCommonData/loadCommonData";
import LoadingIcon from "@/components/loadingIcon/loadingIcon";
import { useFetchMatchupsProjections } from "@/hooks/useFetchMatchupsProjections";
import { AppDispatch, RootState } from "@/redux/store";
import { use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateMatchupsState } from "../redux/matchupsSlice";
import LineupCheck from "../components/lineupCheck";
import Starters from "../components/starters";
import Live from "../components/live";
import { useFetchLive } from "@/hooks/useFetchLive";

interface MatchupsProps {
  params: Promise<{ searched: string }>;
}

const Matchups = ({ params }: MatchupsProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { state } = useSelector((state: RootState) => state.common);
  const { isLoadingMatchups, errorMatchups } = useSelector(
    (state: RootState) => state.user
  );
  const { tab } = useSelector((state: RootState) => state.matchups);

  useFetchMatchupsProjections();
  useFetchLive();

  const component = (
    <>
      {state?.week && <h3>Week {state.week}</h3>}
      {isLoadingMatchups ? (
        <LoadingIcon message="" />
      ) : (
        <>
          <div className="nav-buttons">
            <button
              className={tab === "LC" ? "active" : ""}
              onClick={() =>
                dispatch(updateMatchupsState({ key: "tab", value: "LC" }))
              }
            >
              Lineup Check
            </button>
            <button
              className={tab === "S" ? "active" : ""}
              onClick={() =>
                dispatch(updateMatchupsState({ key: "tab", value: "S" }))
              }
            >
              Starters
            </button>
            <button
              className={tab === "L" ? "active" : ""}
              onClick={() =>
                dispatch(updateMatchupsState({ key: "tab", value: "L" }))
              }
            >
              Live
            </button>
          </div>
          {errorMatchups ||
            (tab === "LC" ? (
              <LineupCheck />
            ) : tab === "S" ? (
              <Starters />
            ) : tab === "L" ? (
              <Live />
            ) : null)}
        </>
      )}
    </>
  );

  return <LoadCommonData searched={searched} component={component} />;
};

export default Matchups;
