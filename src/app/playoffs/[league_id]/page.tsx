"use client";

import { useFetchStateAndAllplayers } from "@/hooks/useFetchStateAllplayers";
import { League } from "@/lib/types/userTypes";
import { RootState } from "@/redux/store";
import axios from "axios";
import { use, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./playoffs.css";
import { getPlayerTotal } from "@/utils/getPlayerStatProjTotal";
import TableMain from "@/components/tableMain/tableMain";
import Avatar from "@/components/avatar/avatar";
import { getOptimalStarters } from "@/utils/getOptimalStarters";
import SortIcon from "@/components/sortIcon/sortIcon";

interface PlayoffsProps {
  params: Promise<{ league_id: string }>;
}

const Playoffs = ({ params }: PlayoffsProps) => {
  const { state, allplayers } = useSelector((state: RootState) => state.common);
  const { league_id } = use(params);
  const [league, setLeague] = useState<League | null>(null);
  const [weeks, setWeeks] = useState<number[]>([18]);
  const [pointsObj, setPointsObj] = useState<{
    [week: string]: {
      [player_id: string]: number;
    };
  }>({});
  const [projObj, setProjObj] = useState<{
    [week: string]: {
      [player_id: string]: number;
    };
  }>({});
  const [scheduleObj, setScheduleObj] = useState<{ [team: string]: boolean }>(
    {}
  );
  const [activeRosterId, setActiveRosterId] = useState("");
  const [sortStandingsBy, setSortStandingsBy] = useState({
    column: 1 as 1 | 2,
    asc: false,
  });

  const rounds = [
    { display: "Week 18", week: 18 },
    { display: "Wildcard", week: 19 },
    { display: "Division", week: 20 },
    { display: "Conference", week: 21 },
    { display: "Super Bowl", week: 22 },
  ];

  useFetchStateAndAllplayers();

  useEffect(() => {
    const fetchLeague = async () => {
      const playoffLeague = await axios.get("/api/league", {
        params: {
          league_id,
        },
      });

      setLeague(playoffLeague.data);
    };

    fetchLeague();
  }, [league_id]);

  useEffect(() => {
    const fetchPlayoffProjStats = async () => {
      if (state?.week) {
        const playoffProjStat: {
          data: {
            [week: string]: {
              players: {
                player_id: string;
                opp: string;
                clock: string;
                percent_game_remaining: number;
                live_proj: { [cat: string]: number };
                stats: { [cat: string]: number };
              }[];
              schedule: {
                start_time: number;
                status: string;
                metadata: { away_team: string; home_team: string };
              }[];
            };
          };
        } = await axios.get("/api/playoffprojstat", {
          params: {
            week: state.week,
          },
        });

        const obj_points: {
          [week: string]: {
            [player_id: string]: number;
          };
        } = {};
        const obj_proj: {
          [week: string]: {
            [player_id: string]: number;
          };
        } = {};

        Object.keys(playoffProjStat.data).forEach((week) => {
          obj_points[week] = {};
          obj_proj[week] = {};

          playoffProjStat.data[week].players.forEach((player) => {
            const points = getPlayerTotal(
              league?.scoring_settings || {},
              player.stats || {}
            );

            const projection = getPlayerTotal(
              league?.scoring_settings || {},
              player.live_proj || {}
            );

            obj_points[week][player.player_id] = points;
            obj_proj[week][player.player_id] = projection;
          });
        });

        setPointsObj(obj_points);
        setProjObj(obj_proj);

        const obj_schedule: { [team: string]: boolean } = {};

        playoffProjStat.data[state.week].schedule.forEach((g) => {
          obj_schedule[g.metadata.away_team] =
            g.status === "in_game" ? true : false;

          obj_schedule[g.metadata.home_team] =
            g.status === "in_game" ? true : false;
        });

        setScheduleObj(obj_schedule);

        if (
          playoffProjStat.data[state.week].schedule.some(
            (g) => g.status === "in_game"
          )
        ) {
          const timeout = setTimeout(fetchPlayoffProjStats, 30000);

          return () => clearTimeout(timeout);
        }
      }
    };

    if (league) fetchPlayoffProjStats();
  }, [state?.week, league]);

  const dataStandings = (league?.rosters || [])
    .sort((a, b) => {
      const roster_points_a = weeks.reduce((acc, cur) => {
        const optimal_week = getOptimalStarters(
          league?.roster_positions || [],
          a.players || [],
          pointsObj[cur] || {}
        );

        const week_total = optimal_week.reduce(
          (acc_w, cur_w) => acc_w + (pointsObj[cur]?.[cur_w] || 0),
          0
        );

        return acc + week_total;
      }, 0);

      const roster_projection_a = weeks.reduce((acc, cur) => {
        const optimal_week = getOptimalStarters(
          league?.roster_positions || [],
          a.players || [],
          projObj[cur] || {}
        );

        const week_total = optimal_week.reduce(
          (acc_w, cur_w) => acc_w + (projObj[cur]?.[cur_w] || 0),
          0
        );

        return acc + week_total;
      }, 0);

      const roster_points_b = weeks.reduce((acc, cur) => {
        const optimal_week = getOptimalStarters(
          league?.roster_positions || [],
          b.players || [],
          pointsObj[cur] || {}
        );

        const week_total = optimal_week.reduce(
          (acc_w, cur_w) => acc_w + (pointsObj[cur]?.[cur_w] || 0),
          0
        );

        return acc + week_total;
      }, 0);

      const roster_projection_b = weeks.reduce((acc, cur) => {
        const optimal_week = getOptimalStarters(
          league?.roster_positions || [],
          b.players || [],
          projObj[cur] || {}
        );

        const week_total = optimal_week.reduce(
          (acc_w, cur_w) => acc_w + (projObj[cur]?.[cur_w] || 0),
          0
        );

        return acc + week_total;
      }, 0);

      if (sortStandingsBy.column === 2) {
        return roster_projection_b - roster_projection_a;
      } else {
        return roster_points_b - roster_points_a;
      }
    })
    .map((roster, index) => {
      const roster_points = weeks.reduce((acc, cur) => {
        const optimal_week = getOptimalStarters(
          league?.roster_positions || [],
          roster.players || [],
          pointsObj[cur] || {}
        );

        const week_total = optimal_week.reduce(
          (acc_w, cur_w) => acc_w + (pointsObj[cur]?.[cur_w] || 0),
          0
        );

        return acc + week_total;
      }, 0);

      const roster_projection = weeks.reduce((acc, cur) => {
        const optimal_week = getOptimalStarters(
          league?.roster_positions || [],
          roster.players || [],
          projObj[cur] || {}
        );

        const week_total = optimal_week.reduce(
          (acc_w, cur_w) => acc_w + (projObj[cur]?.[cur_w] || 0),
          0
        );

        return acc + week_total;
      }, 0);

      const inprogress = (roster.players || []).some(
        (player_id) => scheduleObj[allplayers?.[player_id].team || ""]
      )
        ? "inprogress"
        : "";
      return {
        id: roster.roster_id.toString(),
        sortby: roster_points,
        columns: [
          {
            text: (index + 1).toString(),
            colspan: 1,
            classname: inprogress,
          },
          {
            text: <Avatar id={roster.avatar} text={roster.username} type="U" />,
            colspan: 5,
            classname: inprogress,
          },
          {
            text: roster_points.toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }),
            colspan: 2,
            classname:
              sortStandingsBy.column === 1 ? inprogress + " sort" : inprogress,
          },
          {
            text: roster_projection.toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }),
            colspan: 2,
            classname:
              sortStandingsBy.column === 2 ? inprogress + " sort" : inprogress,
          },
        ],
      };
    });

  const activeRoster = (league?.rosters || []).find(
    (r) => r.roster_id.toString() === activeRosterId
  );

  const active_optimal_starters =
    (league &&
      activeRoster &&
      weeks.length === 1 &&
      getOptimalStarters(
        league.roster_positions,
        activeRoster.players || [],
        projObj[weeks[0]]
      )) ||
    [];

  const dataTeam =
    (league &&
      activeRoster &&
      weeks.length === 1 &&
      weeks[0] === state?.week && [
        ...league.roster_positions
          .filter((rp) => rp !== "BN")
          .map((rp, index) => {
            const player_id = active_optimal_starters[index];
            return {
              id: `${rp}__${index}`,
              columns: [
                {
                  text: rp,
                  colspan: 1,
                  classname: scheduleObj[allplayers?.[player_id].team || ""]
                    ? "inprogress"
                    : "",
                },
                {
                  text: (
                    <Avatar
                      id={player_id}
                      text={allplayers?.[player_id]?.full_name || player_id}
                      type="P"
                    />
                  ),
                  classname: scheduleObj[allplayers?.[player_id].team || ""]
                    ? "inprogress"
                    : "",
                  colspan: 3,
                },
                {
                  text: (pointsObj[weeks[0]]?.[player_id] || 0).toLocaleString(
                    "en-US",
                    {
                      maximumFractionDigits: 1,
                    }
                  ),
                  colspan: 1,
                  classname: scheduleObj[allplayers?.[player_id].team || ""]
                    ? "inprogress"
                    : "",
                },
                {
                  text: (projObj[weeks[0]]?.[player_id] || 0).toLocaleString(
                    "en-US",
                    {
                      maximumFractionDigits: 1,
                    }
                  ),
                  colspan: 1,
                  classname: scheduleObj[allplayers?.[player_id].team || ""]
                    ? "inprogress"
                    : "",
                },
              ],
            };
          }),

        ...(activeRoster.players || [])
          .sort(
            (a, b) =>
              (projObj[state.week][b] || 0) - (projObj[state.week][a] || 0)
          )
          .filter((player_id) => !active_optimal_starters.includes(player_id))
          .map((player_id) => {
            return {
              id: player_id,
              columns: [
                {
                  text: "BN",
                  colspan: 1,
                  classname:
                    "bench " +
                    (scheduleObj[allplayers?.[player_id].team || ""]
                      ? "inprogress"
                      : ""),
                },
                {
                  text: (
                    <Avatar
                      id={player_id}
                      text={allplayers?.[player_id]?.full_name || player_id}
                      type="P"
                    />
                  ),
                  classname:
                    "bench " +
                    (scheduleObj[allplayers?.[player_id].team || ""]
                      ? "inprogress"
                      : ""),
                  colspan: 3,
                },
                {
                  text: (pointsObj[weeks[0]][player_id] || 0).toLocaleString(
                    "en-US",
                    {
                      maximumFractionDigits: 1,
                    }
                  ),
                  colspan: 1,
                  classname:
                    "bench " +
                    (scheduleObj[allplayers?.[player_id].team || ""]
                      ? "inprogress"
                      : ""),
                },
                {
                  text: (projObj[weeks[0]][player_id] || 0).toLocaleString(
                    "en-US",
                    {
                      maximumFractionDigits: 1,
                    }
                  ),
                  colspan: 1,
                  classname:
                    "bench " +
                    (scheduleObj[allplayers?.[player_id].team || ""]
                      ? "inprogress"
                      : ""),
                },
              ],
            };
          }),
      ]) ||
    [];
  return (
    <>
      <h1>
        <Avatar id={league?.avatar} text={league?.name || ""} type="L" />
      </h1>

      <div className="rounds-buttons">
        {rounds.map((round) => {
          return (
            <button
              key={round.week}
              className={weeks.includes(round.week) ? "active" : ""}
              onClick={() =>
                weeks.includes(round.week)
                  ? setWeeks((prevState) =>
                      prevState.filter((r) => r !== round.week)
                    )
                  : setWeeks((prevState) => [...prevState, round.week])
              }
            >
              {round.display}
            </button>
          );
        })}
      </div>

      <TableMain
        type={1}
        half={true}
        headers_sort={[
          { text: "", colspan: 1 },
          { text: "", colspan: 5 },

          {
            text: (
              <SortIcon
                colNum={1}
                sortBy={sortStandingsBy}
                setSortBy={(column) =>
                  setSortStandingsBy({ column: column as 1 | 2, asc: false })
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
                setSortBy={(column) =>
                  setSortStandingsBy({ column: column as 1 | 2, asc: false })
                }
              />
            ),
            colspan: 2,
          },
        ]}
        headers={[
          { text: "Rk", colspan: 1 },
          { text: "Manager", colspan: 5 },
          { text: "Pts", colspan: 2 },
          { text: "Proj", colspan: 2 },
        ]}
        data={dataStandings}
        active={activeRosterId}
        setActive={setActiveRosterId}
      />
      <TableMain
        type={1}
        half={true}
        headers={[
          { text: "Slot", colspan: 1 },
          { text: "Player", colspan: 3 },
          { text: "Pts", colspan: 1 },
          { text: "Proj", colspan: 1 },
        ]}
        data={dataTeam}
      />
    </>
  );
};

export default Playoffs;
