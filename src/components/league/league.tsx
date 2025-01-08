import { League as LeagueType } from "@/lib/types/userTypes";
import TableMain from "../tableMain/tableMain";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { usePathname } from "next/navigation";
import Avatar from "../avatar/avatar";
import ColumnDropdown from "../columnDropdown/columnDropdown";
import {
  standingsColumnOptions,
  getStandingsColumn,
  getStandingsColumnSort,
  teamColumnOptions,
  getTeamColumn,
} from "./helpers/getStandingsColumn";
import { updateLeagueState } from "./redux/leagueSlice";
import SortIcon from "../sortIcon/sortIcon";
import { syncLeague } from "@/redux/userActions";
import { getDraftPickId } from "@/utils/getPickId";
import { getSlotAbbrev } from "@/utils/getOptimalStarters";

type LeagueProps = {
  type: number;
  league: LeagueType;
};

const League = ({ league, type }: LeagueProps) => {
  const pathname = usePathname();
  const dispatch: AppDispatch = useDispatch();
  const {
    allplayers,
    state: stateState,
    ktc_current,
  } = useSelector((state: RootState) => state.common);
  const { isSyncingLeague } = useSelector((state: RootState) => state.user);
  const {
    column1_standings,
    column2_standings,
    sortStandingsBy,
    column1_team,
  } = useSelector((state: RootState) => state.league);
  const [activeRosterId, setActiveRosterId] = useState("0");

  const activeRoster = league.rosters.find(
    (r) => r.roster_id.toString() === activeRosterId
  );

  console.log({ ktc_current });
  useEffect(() => {
    if (league?.userRoster)
      setActiveRosterId(league.userRoster.roster_id.toString());
  }, [league.userRoster]);

  const handleSync = () => {
    dispatch(
      syncLeague({
        league_id: league.league_id,
        roster_id: league.userRoster.roster_id,
        season: stateState?.season as string,
        week: stateState?.week as number,
      })
    );
  };

  return (
    <>
      <div className="nav">
        <div></div>
        {!pathname.includes("trades") && (
          <div className="sync">
            <i
              className={
                "fa-solid fa-arrows-rotate " +
                (isSyncingLeague === league.league_id ? "rotate" : "")
              }
              onClick={handleSync}
            ></i>
          </div>
        )}
        <div></div>
      </div>
      <TableMain
        type={type}
        half={true}
        headers_sort={[
          {
            text: "",
            colspan: 1,
          },
          {
            text: "",
            colspan: 3,
          },
          {
            text: (
              <SortIcon
                colNum={1}
                sortBy={sortStandingsBy}
                setSortBy={(colNum, asc) =>
                  dispatch(
                    updateLeagueState({
                      key: "sortStandingsBy",
                      value: { column: colNum as 1 | 2, asc: asc },
                    })
                  )
                }
              />
            ),
            colspan: 2,
          },
          {
            text: (
              <SortIcon
                colNum={2}
                sortBy={sortStandingsBy}
                setSortBy={(colNum, asc) =>
                  dispatch(
                    updateLeagueState({
                      key: "sortStandingsBy",
                      value: { column: colNum as 1 | 2, asc: asc },
                    })
                  )
                }
              />
            ),
            colspan: 2,
          },
        ]}
        headers={[
          {
            text: "Rk",
            colspan: 1,
          },
          {
            text: "Manager",
            colspan: 3,
          },
          {
            text: (
              <ColumnDropdown
                options={standingsColumnOptions}
                columnText={column1_standings}
                setColumnText={(colValue) =>
                  dispatch(
                    updateLeagueState({
                      key: "column1_standings",
                      value: colValue,
                    })
                  )
                }
              />
            ),
            colspan: 2,
          },
          {
            text: (
              <ColumnDropdown
                options={standingsColumnOptions}
                columnText={column2_standings}
                setColumnText={(colValue) => {
                  dispatch(
                    updateLeagueState({
                      key: "column2_standings",
                      value: colValue,
                    })
                  );
                }}
              />
            ),
            colspan: 2,
          },
        ]}
        data={[...league.rosters]
          .sort((a, b) => {
            const a_sortby = getStandingsColumnSort(a);
            const b_sortby = getStandingsColumnSort(b);

            return b_sortby > a_sortby ? 1 : -1;
          })
          .map((roster, index) => {
            return {
              id: roster.roster_id.toString(),
              columns: [
                {
                  text: (index + 1).toString(),
                  colspan: 1,
                  classname: "",
                },
                {
                  text: (
                    <Avatar
                      id={roster.avatar}
                      text={roster.username}
                      type="U"
                    />
                  ),
                  colspan: 3,
                  classname: "",
                },
                ...[column1_standings, column2_standings].map((col, index) => {
                  const { text, trendColor, classname } = getStandingsColumn(
                    col,
                    roster,
                    league.rosters
                  );
                  return {
                    text,
                    colspan: 2,
                    style: trendColor || {},
                    classname:
                      sortStandingsBy.column === index + 1
                        ? "sort " + classname
                        : classname,
                  };
                }),
              ],
            };
          })}
        active={activeRosterId.toString()}
        setActive={setActiveRosterId}
      />
      <TableMain
        type={type}
        half={true}
        headers={[
          { text: "Slot", colspan: 1 },
          { text: "Player", colspan: 3 },
          {
            text: (
              <ColumnDropdown
                options={teamColumnOptions}
                columnText={column1_team}
                setColumnText={(colValue) =>
                  dispatch(
                    updateLeagueState({ key: "column1_team", value: colValue })
                  )
                }
              />
            ),
            colspan: 2,
          },
        ]}
        data={[
          ...league.roster_positions
            .filter((rp) => rp !== "BN")
            .map((rp, index) => {
              const player_id = activeRoster?.starters_optimal?.[index] || "0";

              const { text, trendColor, classname } = getTeamColumn(
                column1_team,
                player_id
              );

              return {
                id: `${rp}__${index}`,
                columns: [
                  {
                    text: getSlotAbbrev(rp),
                    colspan: 1,
                    classname: "slot",
                  },
                  {
                    text:
                      (allplayers && player_id && allplayers[player_id] && (
                        <Avatar
                          id={player_id}
                          text={allplayers[player_id].full_name}
                          type="P"
                        />
                      )) ||
                      "-",
                    colspan: 3,
                    classname: "",
                  },
                  {
                    text,
                    colspan: 2,
                    style: trendColor || {},
                    classname,
                  },
                ],
              };
            }),
          ...(activeRoster?.players
            ?.filter(
              (player_id) => !activeRoster.starters_optimal?.includes(player_id)
            )
            ?.sort((a, b) => {
              const getPositionValue = (player_id: string) => {
                const position = allplayers && allplayers[player_id]?.position;

                switch (position) {
                  case "QB":
                    return 1;
                  case "RB":
                    return 2;
                  case "FB":
                    return 2;
                  case "WR":
                    return 3;
                  case "TE":
                    return 4;
                  default:
                    return 5;
                }
              };

              return (
                getPositionValue(a) - getPositionValue(b) ||
                (ktc_current?.[b] || 0) - (ktc_current?.[a] || 0)
              );
            })
            ?.map((player_id) => {
              const { text, trendColor, classname } = getTeamColumn(
                column1_team,
                player_id
              );

              return {
                id: player_id,
                columns: [
                  {
                    text: "BN",
                    colspan: 1,
                    classname: "slot",
                  },
                  {
                    text:
                      (allplayers && player_id && allplayers[player_id] && (
                        <Avatar
                          id={player_id}
                          text={allplayers[player_id].full_name}
                          type="P"
                        />
                      )) ||
                      "-",
                    colspan: 3,
                    classname: "",
                  },
                  {
                    text,
                    colspan: 2,
                    style: trendColor || {},
                    classname,
                  },
                ],
              };
            }) || []),
          ...([...(activeRoster?.draftpicks || [])]
            ?.sort(
              (a, b) =>
                a.season - b.season ||
                a.round - b.round ||
                (a.order || 0) - (b.order || 0) ||
                (b.roster_id === activeRoster?.roster_id ? 1 : 0) -
                  (a.roster_id === activeRoster?.roster_id ? 1 : 0)
            )
            ?.map((pick) => {
              const pick_id = getDraftPickId(pick);

              const { text, trendColor, classname } = getTeamColumn(
                column1_team,
                pick_id
              );

              return {
                id: `${pick.season}_${pick.round}_${pick.roster_id}`,
                columns: [
                  {
                    text: "PK",
                    colspan: 1,
                    classname: "slot",
                  },
                  {
                    text: pick.order
                      ? `${pick.season} ${
                          pick.round
                        }.${pick.order.toLocaleString("en-US", {
                          minimumIntegerDigits: 2,
                        })}`
                      : `${pick.season} Round ${pick.round}` +
                        (pick.roster_id === activeRoster?.roster_id
                          ? ""
                          : ` ${pick.original_user.username}`),
                    colspan: 3,
                    classname: "",
                  },
                  {
                    text,
                    colspan: 2,
                    style: trendColor || {},
                    classname,
                  },
                ],
              };
            }) || []),
        ]}
      />
    </>
  );
};

export default League;
