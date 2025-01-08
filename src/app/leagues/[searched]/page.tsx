"use client";

import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { use, useMemo } from "react";
import { useFetchStateAndAllplayers } from "@/hooks/useFetchStateAllplayers";
import { useFetchUserAndLeagues } from "@/hooks/useFetchUserLeagues";
import TableMain from "@/components/tableMain/tableMain";
import SortIcon from "@/components/sortIcon/sortIcon";
import { updateLeaguesState } from "../redux/leaguesSlice";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import {
  getLeaguesColumnSortValue,
  leaguesColumnOptions,
} from "@/utils/getLeaguesColumn";
import Avatar from "@/components/avatar/avatar";
import League from "@/components/league/league";
import LoadCommonData from "@/components/loadCommonData/loadCommonData";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { getKtcAvgValue, getKtcTotValue } from "@/utils/getTeamKtcValues";
import { getTrendColor_Range } from "@/utils/getTrendColor";

interface LeaguesProps {
  params: Promise<{ searched: string }>;
}

type colObj = {
  sort: number | string;
  text: string | JSX.Element;
  trendColor: { [key: string]: string };
  classname: string;
};

type LeagueObj = {
  [key: string]: colObj;
};

const Leagues = ({ params }: LeaguesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const { state } = useSelector((state: RootState) => state.common);
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

  const leaguesObj = useMemo(() => {
    const obj: {
      [league_id: string]: LeagueObj;
    } = {};

    Object.values(leagues || {})?.forEach((league) => {
      const rank =
        [...league.rosters]
          .sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.fp - a.fp)
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      const rank_points =
        [...league.rosters]
          .sort((a, b) => b.fp - a.fp)
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      const ktc_s_rk =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcAvgValue(b.starters_optimal || []) -
              getKtcAvgValue(a.starters_optimal || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      const ktc_pk_rk =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcTotValue([], b.draftpicks || []) -
              getKtcTotValue([], a.draftpicks || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      const ktc_t_rk =
        [...league.rosters]
          .sort(
            (a, b) =>
              getKtcTotValue(b.players || [], b.draftpicks || []) -
              getKtcTotValue(a.players || [], a.draftpicks || [])
          )
          .findIndex((r) => r.roster_id === league.userRoster.roster_id) + 1;

      const ktc_s_avg = getKtcAvgValue(
        league.userRoster.starters_optimal || []
      );

      const ktc_b_avg = getKtcAvgValue(
        (league.userRoster.players || []).filter(
          (player_id) =>
            !league.userRoster.starters_optimal?.includes(player_id)
        )
      );

      obj[league.league_id] = {
        Rk: {
          sort: rank,
          text: rank.toString(),
          trendColor: getTrendColor_Range(
            rank,
            1,
            league.rosters.length + 1,
            true
          ),
          classname: "rank",
        },
        "Pts Rk": {
          sort: rank_points,
          text: rank_points.toString(),
          trendColor: getTrendColor_Range(
            rank_points,
            1,
            league.rosters.length + 1,
            true
          ),
          classname: "rank",
        },
        "KTC S Rk": {
          sort: ktc_s_rk,
          text: ktc_s_rk.toString(),
          trendColor: getTrendColor_Range(
            ktc_s_rk,
            1,
            league.rosters.length + 1,
            true
          ),
          classname: "rank",
        },
        "KTC T Rk": {
          sort: ktc_t_rk,
          text: ktc_t_rk.toString(),
          trendColor: getTrendColor_Range(
            ktc_t_rk,
            1,
            league.rosters.length + 1,
            true
          ),
          classname: "rank",
        },
        "KTC Pk Rk": {
          sort: ktc_pk_rk,
          text: ktc_pk_rk.toString(),
          trendColor: getTrendColor_Range(
            ktc_pk_rk,
            1,
            league.rosters.length + 1,
            true
          ),
          classname: "rank",
        },
        "KTC S Avg": {
          sort: -ktc_s_avg,
          text: ktc_s_avg.toString(),
          trendColor: getTrendColor_Range(ktc_s_avg, 1000, 8000),
          classname: "ktc",
        },
        "KTC B Avg": {
          sort: -ktc_b_avg,
          text: ktc_b_avg.toString(),
          trendColor: getTrendColor_Range(ktc_b_avg, 1000, 8000),
          classname: "ktc",
        },
        "Trade D": {
          sort: league.settings.disable_trades
            ? 0
            : -league.settings.trade_deadline,
          text: league.settings.disable_trades ? (
            "-"
          ) : league.settings.trade_deadline === 99 ? (
            <i className="fa-solid fa-infinity"></i>
          ) : (
            league.settings.trade_deadline.toString()
          ),
          trendColor: {},
          classname:
            (typeof state?.week === "number" && typeof state.season === "string"
              ? state.season === league.season
                ? league.settings.trade_deadline < state?.week ||
                  league.settings.disable_trades
                  ? "red"
                  : "green"
                : parseInt(state.season) <= parseInt(league.season)
                ? "green"
                : ""
              : "") +
            (league.settings.trade_deadline === 99 ? " infinity " : " ") +
            "setting",
        },
      };
    });

    return obj;
  }, [leagues, state]);

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
                /*
                const { text, trendColor, classname } = getLeaguesColumn(
                  col,
                  league
                );
                */

                const { text, trendColor, classname } =
                  leaguesObj[league.league_id][col as keyof LeagueObj] || {};

                return {
                  text: text || "-",
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
