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

interface PlayoffsProps {
  params: Promise<{ league_id: string }>;
}

const Playoffs = ({ params }: PlayoffsProps) => {
  const { state } = useSelector((state: RootState) => state.common);
  const { league_id } = use(params);
  const [league, setLeague] = useState<League | null>(null);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [playoffData, setPlayoffData] = useState<{
    [week: string]: {
      [player_id: string]: { points: number; projection: number };
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
            };
          };
        } = await axios.get("/api/playoffprojstat", {
          params: {
            week: state.week,
          },
        });

        console.log({ playoffProjStat });

        const data = Object.fromEntries(
          Object.keys(playoffProjStat.data).map((week) => [
            week,
            Object.fromEntries(
              playoffProjStat.data[week].players.map((player) => {
                const points = getPlayerTotal(
                  league?.scoring_settings || {},
                  player.stats || {}
                );

                const projection = getPlayerTotal(
                  league?.scoring_settings || {},
                  player.live_proj || {}
                );

                return [
                  player.player_id,
                  {
                    points,
                    projection,
                  },
                ];
              })
            ),
          ])
        );

        console.log({ data });
        setPlayoffData(data);
      }
    };

    if (league) fetchPlayoffProjStats();
  }, [state?.week, league]);

  const dataStandings = (league?.rosters || [])
    .map((roster, index) => {
      const roster_total = weeks.reduce((acc, cur) => {
        const roster_week = (roster.players || []).reduce(
          (acc_p, cur_p) => acc_p + (playoffData[cur]?.[cur_p]?.points || 0),
          0
        );

        return acc + roster_week;
      }, 0);

      return {
        id: roster.roster_id.toString(),
        sortby: roster_total,
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
            text: roster_total.toString(),
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

  console.log({ activeRoster });
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
      <TableMain type={1} half={true} headers={[]} data={[]} />
    </>
  );
};

export default Playoffs;
