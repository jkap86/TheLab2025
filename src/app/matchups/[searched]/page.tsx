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
import { filterLeagueIds } from "@/utils/filterLeagues";
import { getTotal } from "../helpers/getMatchupsColumn";

interface MatchupsProps {
  params: Promise<{ searched: string }>;
}

const Matchups = ({ params }: MatchupsProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { state } = useSelector((state: RootState) => state.common);
  const { isLoadingMatchups, errorMatchups, live_stats, matchups, leagues } =
    useSelector((state: RootState) => state.user);
  const { tab } = useSelector((state: RootState) => state.matchups);

  useFetchMatchupsProjections();
  useFetchLive();

  const record =
    matchups &&
    filterLeagueIds(Object.keys(matchups))
      .filter(
        (league_id) =>
          leagues &&
          matchups?.[league_id].user.playoffs_alive?.includes(
            leagues[league_id].userRoster.roster_id
          )
      )
      .reduce(
        (acc, cur) => {
          const user_m = matchups[cur].user;
          const opp_m = matchups[cur].opp;
          return {
            wins:
              acc.wins +
              (getTotal(user_m.starters, user_m.players_points) >
              getTotal(opp_m.starters, opp_m.players_points)
                ? 1
                : 0),
            losses:
              acc.losses +
              (getTotal(user_m.starters, user_m.players_points) <
              getTotal(opp_m.starters, opp_m.players_points)
                ? 1
                : 0),
          };
        },
        { wins: 0, losses: 0 }
      );

  const record_live =
    live_stats &&
    filterLeagueIds(Object.keys(live_stats || {}))
      .filter(
        (league_id) =>
          leagues &&
          matchups?.[league_id].user.playoffs_alive?.includes(
            leagues[league_id].userRoster.roster_id
          )
      )
      .reduce(
        (acc, cur) => {
          return {
            wins:
              acc.wins +
              (live_stats[cur].user_proj > live_stats[cur].opp_proj ? 1 : 0),
            losses:
              acc.losses +
              (live_stats[cur].user_proj < live_stats[cur].opp_proj ? 1 : 0),
          };
        },
        { wins: 0, losses: 0 }
      );

  const component = (
    <>
      {state?.week && <h1>Week {state.week}</h1>}
      <h1>
        {record?.wins}-{record?.losses}
      </h1>
      <h1>
        {record_live?.wins}-{record_live?.losses}
      </h1>
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
