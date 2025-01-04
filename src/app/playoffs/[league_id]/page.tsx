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
  const [activeRosterId, setActiveRosterId] = useState("");

  console.log({ league });

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
              schedule: { start_time: number; status: string }[];
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

        if (
          playoffProjStat.data[state.week].schedule.some((g) =>
            g.status.includes("prog")
          )
        ) {
          const timeout = setTimeout(fetchPlayoffProjStats, 60000);

          return () => clearTimeout(timeout);
        }
      }
    };

    if (league) fetchPlayoffProjStats();
  }, [state?.week, league]);

  const dataStandings = (league?.rosters || [])
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

      return {
        id: roster.roster_id.toString(),
        sortby: roster_points,
        columns: [
          {
            text: (index + 1).toString(),
            colspan: 1,
            classname: "",
          },
          {
            text: <Avatar id={roster.avatar} text={roster.username} type="U" />,
            colspan: 3,
            classname: "",
          },
          {
            text: roster_points.toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }),
            colspan: 2,
            classname: "",
          },
          {
            text: roster_projection.toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }),
            colspan: 2,
            classname: "",
          },
        ],
      };
    })
    .sort((a, b) => b.sortby - a.sortby);

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
                  classname: "",
                },
                {
                  text: (
                    <Avatar
                      id={player_id}
                      text={allplayers?.[player_id]?.full_name || player_id}
                      type="P"
                    />
                  ),
                  classname: "",
                  colspan: 3,
                },
                {
                  text: pointsObj[weeks[0]][player_id].toLocaleString("en-US", {
                    maximumFractionDigits: 1,
                  }),
                  colspan: 1,
                  classname: "",
                },
                {
                  text: projObj[weeks[0]][player_id].toLocaleString("en-US", {
                    maximumFractionDigits: 1,
                  }),
                  colspan: 1,
                  classname: "",
                },
              ],
            };
          }),

        ...(activeRoster.players || [])
          .filter((player_id) => !active_optimal_starters.includes(player_id))
          .map((player_id) => {
            return {
              id: player_id,
              columns: [
                {
                  text: "BN",
                  colspan: 1,
                  classname: "",
                },
                {
                  text: (
                    <Avatar
                      id={player_id}
                      text={allplayers?.[player_id]?.full_name || player_id}
                      type="P"
                    />
                  ),
                  classname: "",
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
                  classname: "",
                },
                {
                  text: (projObj[weeks[0]][player_id] || 0).toLocaleString(
                    "en-US",
                    {
                      maximumFractionDigits: 1,
                    }
                  ),
                  colspan: 1,
                  classname: "",
                },
              ],
            };
          }),
      ]) ||
    [];
  return (
    <>
      <h1>{league?.name}</h1>
      <div className="rounds-buttons">
        {rounds.map((round) => {
          return (
            <div
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
            </div>
          );
        })}
      </div>
      <TableMain
        type={1}
        half={true}
        headers={[]}
        data={dataStandings}
        active={activeRosterId}
        setActive={setActiveRosterId}
      />
      <TableMain type={1} half={true} headers={[]} data={dataTeam} />
    </>
  );
};

export default Playoffs;
