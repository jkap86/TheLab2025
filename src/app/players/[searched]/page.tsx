"use client";

import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { use, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateState as updatePlayersState } from "../redux/playersSlice";
import { updateState } from "@/redux/commonSlice";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import {
  columnOptions,
  getPlayersSortValue,
  getPlayersColumn,
} from "../helpers/playersColumn";
import SortIcon from "@/components/sortIcon/sortIcon";
import Avatar from "@/components/avatar/avatar";
import PlayerLeagues from "../components/playerLeagues/playerLeagues";
import LoadCommonData from "@/components/loadCommonData/loadCommonData";
import axios from "axios";

interface PlayersProps {
  params: Promise<{ searched: string }>;
}

const Players = ({ params }: PlayersProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { allplayers, ktc_previous, ktc_peak } = useSelector(
    (state: RootState) => state.common
  );
  const { playershares } = useSelector((state: RootState) => state.user);
  const {
    column1,
    column2,
    column3,
    column4,
    page,
    sortPlayersBy,
    activePlayer,
    searchedPlayer,
    trendDate,
  } = useSelector((state: RootState) => state.players);

  useEffect(() => {
    const fetchKTCPrev = async () => {
      if (
        trendDate &&
        ktc_previous.date !== trendDate &&
        [column1, column2, column3, column4].includes("KTC T")
      ) {
        const ktc_previous_raw = await axios.get("/api/ktc", {
          params: {
            trendDate,
          },
        });

        const obj = Object.fromEntries(ktc_previous_raw.data.values);

        dispatch(
          updateState({
            key: "ktc_previous",
            value: {
              date: ktc_previous_raw.data.date,
              values: obj,
            },
          })
        );
      }
    };
    fetchKTCPrev();
  }, [trendDate, ktc_previous, column1, column2, column3, column4, dispatch]);

  useEffect(() => {
    const fetchKTCPeak = async () => {
      if (
        trendDate &&
        ktc_peak.date !== trendDate &&
        [column1, column2, column3, column4].some((col) =>
          ["KTC P", "KTC PD", "KTC L", "KTC LD"].includes(col)
        )
      ) {
        const ktc_peak_raw = await axios.get("/api/ktcpeak", {
          params: {
            trendDate,
          },
        });

        console.log({ ktc_peak_raw });

        dispatch(
          updateState({
            key: "ktc_peak",
            value: {
              date: ktc_peak_raw.data.date,
              max_values: ktc_peak_raw.data.max_values_obj,
              min_values: ktc_peak_raw.data.min_values_obj,
            },
          })
        );
      }
    };

    fetchKTCPeak();
  }, [trendDate, ktc_peak, column1, column2, column3, column4, dispatch]);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;
    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortPlayersBy}
          setSortBy={(colNum, asc) =>
            dispatch(
              updatePlayersState({
                key: "sortPlayersBy",
                value: { column: colNum, asc: asc },
              })
            )
          }
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortPlayersBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "Player",
      colspan: 3,
      classname: sortPlayersBy.column === 0 ? "sort" : "",
    },
    ...[
      { var: column1, key: "column1" },
      { var: column2, key: "column2" },
      { var: column3, key: "column3" },
      { var: column4, key: "column4" },
    ].map((col, index) => {
      return {
        text: (
          <ColumnDropdown
            columnText={col.var}
            setColumnText={(value) =>
              dispatch(
                updatePlayersState({
                  key: col.key as "column1" | "column2" | "column3" | "column4",
                  value,
                })
              )
            }
            options={columnOptions}
          />
        ),
        colspan: 1,
        classname: sortPlayersBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const data = Object.keys(playershares)
    .filter((player_id) => allplayers?.[player_id]?.full_name)
    .map((player_id) => {
      return {
        id: player_id,
        sortby: getPlayersSortValue(player_id, trendDate),
        search: {
          text: allplayers?.[player_id]?.full_name || player_id,
          display: (allplayers && (
            <Avatar
              id={player_id}
              text={allplayers[player_id]?.full_name}
              type="P"
            />
          )) || <>{player_id}</>,
        },
        columns: [
          {
            text: (
              <Avatar
                id={player_id}
                text={(allplayers && allplayers[player_id].full_name) || "-"}
                type="P"
              />
            ),
            colspan: 3,
            classname: sortPlayersBy.column === 0 ? "sort" : "",
          },
          ...[column1, column2, column3, column4].map((col, index) => {
            const { text, trendColor, classname } = getPlayersColumn(
              col,
              player_id,
              trendDate
            );

            return {
              text,
              colspan: 1,
              style: trendColor,
              classname:
                sortPlayersBy.column === index + 1
                  ? "sort " + classname
                  : classname,
            };
          }),
        ],
        secondary: <PlayerLeagues player_obj={playershares[player_id]} />,
      };
    })
    .sort((a, b) =>
      sortPlayersBy.asc
        ? a.sortby > b.sortby
          ? 1
          : -1
        : a.sortby < b.sortby
        ? 1
        : -1
    );

  const setPage = (p: number) =>
    dispatch(updatePlayersState({ key: "page", value: p }));

  const setActive = (player_id: string) =>
    dispatch(updatePlayersState({ key: "activePlayer", value: player_id }));

  const search = {
    searched: searchedPlayer,
    setSearched: (searched: string) =>
      dispatch(updatePlayersState({ key: "searchedPlayer", value: searched })),

    placeholder: "Search Players",
  };

  const component = (
    <>
      {[column1, column2, column3, column4].some((col) =>
        ["KTC T", "KTC P", "KTC PD", "KTC L", "KTC LD"].includes(col)
      ) && (
        <h1>
          {trendDate === "" && "Select Date for Historical Values/Trends"}
          <br />
          <input
            type="date"
            value={trendDate}
            onChange={(e) =>
              dispatch(
                updatePlayersState({ key: "trendDate", value: e.target.value })
              )
            }
          />
        </h1>
      )}
      <TableMain
        type={1}
        headers_sort={headers_sort}
        headers={headers}
        data={data}
        page={page}
        setPage={setPage}
        active={activePlayer}
        setActive={setActive}
        search={search}
      />
    </>
  );

  return <LoadCommonData searched={searched} component={component} />;
};

export default Players;
