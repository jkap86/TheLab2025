"use client";

import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { use } from "react";
import { useFetchStateAndAllplayers } from "@/hooks/useFetchStateAllplayers";
import { useFetchUserAndLeagues } from "@/hooks/useFetchUserLeagues";
import TableMain from "@/components/tableMain/tableMain";
import SortIcon from "@/components/sortIcon/sortIcon";
import { updateLeaguesState } from "../redux/leaguesSlice";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import {
  getLeaguesColumn,
  getLeaguesColumnSortValue,
  leaguesColumnOptions,
} from "@/utils/getLeaguesColumn";
import Avatar from "@/components/avatar/avatar";
import League from "@/components/league/league";
import LoadCommonData from "@/components/loadCommonData/loadCommonData";
import { filterLeagueIds } from "@/utils/filterLeagues";

interface LeaguesProps {
  params: Promise<{ searched: string }>;
}

const Leagues = ({ params }: LeaguesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { leagues } = useSelector((state: RootState) => state.user);
  const {
    column1,
    column2,
    column3,
    column4,
    sortLeaguesBy,
    page,
    activeLeague,
    searchedLeague,
  } = useSelector((state: RootState) => state.leagues);

  useFetchStateAndAllplayers();
  useFetchUserAndLeagues(searched);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;
    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortLeaguesBy}
          setSortBy={(colNum, asc) =>
            dispatch(
              updateLeaguesState({
                key: "sortLeaguesBy",
                value: { column: colNum, asc: asc },
              })
            )
          }
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortLeaguesBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "League",
      colspan: 3,
      classname: sortLeaguesBy.column === 0 ? "sort" : "",
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
                updateLeaguesState({
                  key: col.key as "column1" | "column2" | "column3" | "column4",
                  value,
                })
              )
            }
            options={leaguesColumnOptions}
          />
        ),
        colspan: 1,
        classname: sortLeaguesBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const data =
    (leagues &&
      filterLeagueIds(Object.keys(leagues))
        .sort((a, b) => {
          const a_sortValue = getLeaguesColumnSortValue(
            leagues[a],
            sortLeaguesBy,
            [column1, column2, column3, column4]
          );
          const b_sortValue = getLeaguesColumnSortValue(
            leagues[b],
            sortLeaguesBy,
            [column1, column2, column3, column4]
          );

          return a_sortValue === b_sortValue
            ? leagues[a].index > leagues[b].index
              ? 1
              : -1
            : a_sortValue > b_sortValue
            ? 1
            : -1;
        })
        .map((league_id) => {
          const league = leagues[league_id];
          return {
            id: league.league_id,
            search: {
              text: league.name,
              display: (
                <Avatar id={league.avatar} text={league.name} type="L" />
              ),
            },
            columns: [
              {
                text: <Avatar id={league.avatar} text={league.name} type="L" />,
                colspan: 3,
                classname: sortLeaguesBy.column === 0 ? "sort" : "",
              },
              ...[column1, column2, column3, column4].map((col, index) => {
                const { text, trendColor, classname } = getLeaguesColumn(
                  col,
                  league
                );

                return {
                  text,
                  colspan: 1,
                  style: trendColor,
                  classname:
                    sortLeaguesBy.column === index + 1
                      ? "sort " + classname
                      : classname,
                };
              }),
            ],
            secondary: <League type={2} league={league} />,
          };
        })) ||
    [];

  const setPage = (pageNum: number) =>
    dispatch(updateLeaguesState({ key: "page", value: pageNum }));

  const setActive = (league_id: string) =>
    dispatch(updateLeaguesState({ key: "activeLeague", value: league_id }));

  const search = {
    searched: searchedLeague,
    setSearched: (searched: string) =>
      dispatch(updateLeaguesState({ key: "searchedLeague", value: searched })),

    placeholder: "Search Leagues",
  };

  const component = (
    <>
      {leagues && (
        <h1>{filterLeagueIds(Object.keys(leagues || {})).length} Leagues</h1>
      )}
      <TableMain
        type={1}
        headers_sort={headers_sort}
        headers={headers}
        data={data}
        page={page}
        setPage={setPage}
        active={activeLeague}
        setActive={setActive}
        search={search}
      />
    </>
  );

  return <LoadCommonData searched={searched} component={component} />;
};

export default Leagues;
