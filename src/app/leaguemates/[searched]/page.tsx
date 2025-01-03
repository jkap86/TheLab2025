"use client";

import SortIcon from "@/components/sortIcon/sortIcon";
import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLeaguematesState } from "../redux/leaguematesSlice";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import Avatar from "@/components/avatar/avatar";
import {
  getLeaguematesColumn,
  getLeaguematesSortby,
  leaguematesColumnOptions,
} from "../helpers/leaguematesColumns";
import LeaguemateLeagues from "../components/leaguemateLeagues/leaguemateLeagues";
import LoadCommonData from "@/components/loadCommonData/loadCommonData";

interface LeaguematesProps {
  params: Promise<{ searched: string }>;
}

const Leaguemates = ({ params }: LeaguematesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { leaguemates } = useSelector((state: RootState) => state.user);
  const {
    column1,
    column2,
    column3,
    column4,
    sortLeaguematesBy,
    page,
    activeLeaguemate,
    searchedLeaguemate,
  } = useSelector((state: RootState) => state.leaguemates);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;
    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortLeaguematesBy}
          setSortBy={(colNum, asc) =>
            dispatch(
              updateLeaguematesState({
                key: "sortLeaguematesBy",
                value: { column: colNum, asc: asc },
              })
            )
          }
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortLeaguematesBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "Leaguemate",
      colspan: 3,
      classname: sortLeaguematesBy.column === 0 ? "sort" : "",
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
                updateLeaguematesState({
                  key: col.key as "column1" | "column2" | "column3" | "column4",
                  value,
                })
              )
            }
            options={leaguematesColumnOptions}
          />
        ),
        colspan: 1,
        classname: sortLeaguematesBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const data = Object.values(leaguemates)
    .map((lm) => {
      return {
        id: lm.user_id,
        sortby: getLeaguematesSortby(lm),
        search: {
          text: lm.username,
          display: <Avatar id={lm.avatar} text={lm.username} type="U" />,
        },
        columns: [
          {
            text: <Avatar id={lm.avatar} text={lm.username} type="U" />,
            colspan: 3,
            classname: sortLeaguematesBy.column === 0 ? "sort" : "",
          },
          ...[column1, column2, column3, column4].map((col, index) => {
            const { text, trendColor, classname } = getLeaguematesColumn(
              col,
              lm
            );

            return {
              text,
              colspan: 1,
              style: trendColor,
              classname:
                sortLeaguematesBy.column === index + 1
                  ? "sort " + classname
                  : classname,
            };
          }),
        ],
        secondary: <LeaguemateLeagues league_ids={lm.leagues} />,
      };
    })
    .sort((a, b) =>
      sortLeaguematesBy.asc
        ? a.sortby > b.sortby
          ? 1
          : -1
        : a.sortby < b.sortby
        ? 1
        : -1
    );

  const setPage = (pageNum: number) =>
    dispatch(updateLeaguematesState({ key: "page", value: pageNum }));

  const setActive = (lm_user_id: string) =>
    dispatch(
      updateLeaguematesState({ key: "activeLeaguemate", value: lm_user_id })
    );

  const search = {
    searched: searchedLeaguemate,
    setSearched: (searched: string) => {
      dispatch(
        updateLeaguematesState({ key: "searchedLeaguemate", value: searched })
      );
    },
    placeholder: "Search Leaguemates",
  };
  const component = (
    <TableMain
      type={1}
      headers_sort={headers_sort}
      headers={headers}
      data={data}
      page={page}
      setPage={setPage}
      active={activeLeaguemate}
      setActive={setActive}
      search={search}
    />
  );

  return <LoadCommonData searched={searched} component={component} />;
};

export default Leaguemates;
