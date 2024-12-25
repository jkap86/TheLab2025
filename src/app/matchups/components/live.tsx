import Avatar from "@/components/avatar/avatar";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { getPlayerTotal } from "@/utils/getPlayerStatProjTotal";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateMatchupsState } from "../redux/matchupsSlice";
import { columnOptionsLive, getLiveColumn } from "../helpers/getLiveColumn";
import LiveLeague from "./liveLeague";

const Live = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { leagues, matchups, live_stats } = useSelector(
    (state: RootState) => state.user
  );
  const { column1_l, column2_l, column3_l, column4_l, active_l, page_l } =
    useSelector((state: RootState) => state.matchups);

  const headers = [
    {
      text: "League",
      colspan: 3,
    },
    ...[
      { var: column1_l, key: "column1_l" },
      { var: column2_l, key: "column2_l" },
      { var: column3_l, key: "column3_l" },
      { var: column4_l, key: "column4_l" },
    ].map((col, index) => {
      return {
        text: (
          <ColumnDropdown
            columnText={col.var}
            setColumnText={(value) =>
              dispatch(
                updateMatchupsState({
                  key: col.key as
                    | "column1_l"
                    | "column2_l"
                    | "column3_l"
                    | "column4_l",
                  value,
                })
              )
            }
            options={columnOptionsLive}
          />
        ),
        colspan: 1,
      };
    }),
  ];

  const data =
    (leagues &&
      matchups &&
      filterLeagueIds(Object.keys(matchups))
        .sort((a, b) => leagues[a].index - leagues[b].index)
        .map((league_id) => {
          return {
            id: league_id,
            columns: [
              {
                text: (
                  <Avatar
                    id={leagues[league_id].avatar}
                    text={leagues[league_id].name}
                    type="L"
                  />
                ),
                colspan: 3,
              },
              ...[column1_l, column2_l, column3_l, column4_l].map(
                (col, index) => {
                  const { text, trendColor, classname } = getLiveColumn(
                    col,
                    league_id
                  );

                  return {
                    text,
                    colspan: 1,
                    style: trendColor,
                    classname: classname,
                  };
                }
              ),
            ],
            secondary: <LiveLeague league_id={league_id} />,
          };
        })) ||
    [];
  return (
    <TableMain
      type={1}
      headers={headers}
      data={data}
      active={active_l}
      setActive={(value) =>
        dispatch(updateMatchupsState({ key: "active_l", value }))
      }
      page={page_l}
      setPage={(pageNum) =>
        dispatch(updateMatchupsState({ key: "page_l", value: pageNum }))
      }
    />
  );
};

export default Live;
