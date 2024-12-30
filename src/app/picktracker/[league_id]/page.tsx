"use client";

import Avatar from "@/components/avatar/avatar";
import TableMain from "@/components/tableMain/tableMain";
import { Allplayer } from "@/lib/types/commonTypes";
import { updateState } from "@/redux/commonSlice";
import { AppDispatch, RootState } from "@/redux/store";
import axios from "axios";
import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface PicktrackerProps {
  params: Promise<{ league_id: string }>;
}

interface Picks {
  league: {
    avatar: string;
    name: string;
  };
  picks: {
    pick: string;
    player_id: string;
    player_name: string;
    picked_by: string;
    picked_by_avatar: string;
  }[];
}

const PickTracker = ({ params }: PicktrackerProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { league_id } = use(params);
  const { allplayers } = useSelector((state: RootState) => state.common);
  const [isLoading, setIsLoading] = useState(false);
  const [picks, setPicks] = useState<Picks>({
    league: { avatar: "", name: "" },
    picks: [],
  });

  useEffect(() => {
    const fetchAllPlayers = async () => {
      if (!allplayers) {
        const allplayers_new = await axios.get("/api/allplayers");

        const allplayers_obj: { [key: string]: Allplayer } = {};

        allplayers_new.data.data.forEach((player_obj: Allplayer) => {
          allplayers_obj[player_obj.player_id] = player_obj;
        });

        dispatch(updateState({ key: "allplayers", value: allplayers_obj }));
      }
    };

    fetchAllPlayers();
  }, [allplayers, dispatch]);

  useEffect(() => {
    const fetchPicks = async () => {
      setIsLoading(true);
      const p = await axios.get("/api/picktracker", {
        params: {
          league_id: league_id,
        },
      });

      setPicks(p.data);
      setIsLoading(false);
    };

    fetchPicks();
  }, [league_id]);

  return (
    <>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <h1>
            <Avatar
              id={picks.league?.avatar}
              type="L"
              text={picks.league.name}
            />
          </h1>
          <TableMain
            type={1}
            headers={[
              {
                text: "Pick",
                colspan: 2,
              },
              {
                text: "Manager",
                colspan: 4,
              },
              {
                text: "Kicker",
                colspan: 4,
              },
            ]}
            data={picks.picks.map((pick) => {
              return {
                id: pick.player_id,
                columns: [
                  {
                    text: pick.pick,
                    colspan: 2,
                    classname: "",
                  },
                  {
                    text: (
                      <Avatar
                        id={pick.picked_by_avatar}
                        type="U"
                        text={pick.picked_by}
                      />
                    ),
                    colspan: 4,
                    classname: "",
                  },
                  {
                    text: (
                      <Avatar
                        id={pick.player_id}
                        type="P"
                        text={pick.player_name}
                      />
                    ),
                    colspan: 4,
                    classname: "",
                  },
                ],
              };
            })}
          />
        </>
      )}
    </>
  );
};

export default PickTracker;
