"use client";

import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateState } from "../redux/playersSlice";
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

interface PlayersProps {
  params: Promise<{ searched: string }>;
}

const Players = ({ params }: PlayersProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { allplayers } = useSelector((state: RootState) => state.common);
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
  } = useSelector((state: RootState) => state.players);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;
    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortPlayersBy}
          setSortBy={(colNum, asc) =>
            dispatch(
              updateState({
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
                updateState({
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
        sortby: getPlayersSortValue(player_id),
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
              player_id
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
    dispatch(updateState({ key: "page", value: p }));

  const setActive = (player_id: string) =>
    dispatch(updateState({ key: "activePlayer", value: player_id }));

  const search = {
    searched: searchedPlayer,
    setSearched: (searched: string) =>
      dispatch(updateState({ key: "searchedPlayer", value: searched })),

    placeholder: "Search Players",
  };

  const component = (
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
  );

  return <LoadCommonData searched={searched} component={component} />;
};

export default Players;
