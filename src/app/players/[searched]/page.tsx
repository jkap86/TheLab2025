"use client";

import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { use, useCallback, useEffect, useMemo } from "react";
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
import "../players.css";
import { getSlotAbbrev, position_map } from "@/utils/getOptimalStarters";

interface PlayersProps {
  params: Promise<{ searched: string }>;
}

const Players = ({ params }: PlayersProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const {
    allplayers,
    ktc_trend,
    ktc_peak,
    isLoadingKtcPeak,
    isLoadingKtcTrend,
    isLoadingStatsTrend,
    stats_trend,
  } = useSelector((state: RootState) => state.common);
  const { playershares, pickshares } = useSelector(
    (state: RootState) => state.user
  );
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
    trendDays,
    filterTeam,
    filterDraftClass,
    filterPosition,
  } = useSelector((state: RootState) => state.players);

  const trendDate2 = useMemo(() => {
    return (
      (trendDate &&
        trendDays &&
        new Date(
          new Date(trendDate).getTime() + 1000 * 60 * 60 * 24 * trendDays
        )
          .toISOString()
          .split("T")[0]) ||
      false
    );
  }, [trendDate, trendDays]);

  const fetchKTCPrev = useCallback(async () => {
    if (
      !isLoadingKtcTrend &&
      trendDate &&
      trendDays &&
      !(ktc_trend.date === trendDate && ktc_trend.days === trendDays)
    ) {
      console.log("fetch KTC PREV");
      dispatch(updateState({ key: "isLoadingKtcTrend", value: true }));

      const ktc_previous_raw = await axios.get("/api/ktctrend", {
        params: {
          trendDate1: trendDate,
          trendDate2,
        },
      });

      dispatch(
        updateState({
          key: "ktc_trend",
          value: {
            date: trendDate,
            days: trendDays,
            values: ktc_previous_raw.data,
          },
        })
      );

      dispatch(updateState({ key: "isLoadingKtcTrend", value: false }));
    }
  }, [
    trendDate,
    trendDays,
    trendDate2,
    ktc_trend,
    isLoadingKtcTrend,
    dispatch,
  ]);

  const fetchKTCPeak = useCallback(async () => {
    if (
      !isLoadingKtcPeak &&
      trendDate &&
      trendDays &&
      !(ktc_peak.date === trendDate && ktc_peak.days === trendDays)
    ) {
      dispatch(updateState({ key: "isLoadingKtcPeak", value: true }));

      const ktc_peak_raw = await axios.get("/api/ktcpeak", {
        params: {
          trendDate1: trendDate,
          trendDate2,
        },
      });

      dispatch(
        updateState({
          key: "ktc_peak",
          value: {
            date: trendDate,
            days: trendDays,
            max_values: ktc_peak_raw.data.max_values,
            min_values: ktc_peak_raw.data.min_values,
          },
        })
      );

      dispatch(updateState({ key: "isLoadingKtcPeak", value: false }));
    }
  }, [trendDate, trendDays, trendDate2, ktc_peak, isLoadingKtcPeak, dispatch]);

  const fetchStatsTrend = useCallback(async () => {
    if (
      !isLoadingStatsTrend &&
      trendDate &&
      trendDays &&
      !(stats_trend.date === trendDate && stats_trend.days === trendDays)
    ) {
      dispatch(updateState({ key: "isLoadingStatsTrend", value: true }));

      const stats = await axios.post("/api/stats", {
        trendDate1: trendDate,
        trendDate2,
        season_type: "regular",
        player_ids: Object.keys(playershares),
      });

      dispatch(
        updateState({
          key: "stats_trend",
          value: {
            date: trendDate,
            days: trendDays,
            season_type: "regular",
            values: stats.data,
          },
        })
      );

      dispatch(updateState({ key: "isLoadingStatsTrend", value: false }));
    }
  }, [
    trendDate,
    trendDays,
    trendDate2,
    stats_trend,
    playershares,
    isLoadingStatsTrend,
    dispatch,
  ]);

  console.log({ trendDate, trendDays, ktc_trend, ktc_peak, stats_trend });

  useEffect(() => {
    fetchKTCPeak();
    fetchKTCPrev();
  }, []);

  useEffect(() => {
    if (Object.keys(playershares).length > 0) fetchStatsTrend();
  }, [playershares]);

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

  const data = [
    ...Object.keys(playershares)
      .filter(
        (player_id) =>
          allplayers?.[player_id] &&
          (!filterPosition ||
            position_map[filterPosition]?.includes(
              allplayers?.[player_id]?.position
            )) &&
          (!filterTeam || allplayers?.[player_id]?.team === filterTeam) &&
          (!filterDraftClass ||
            allplayers?.[player_id].years_exp === parseInt(filterDraftClass))
      )
      .map((player_id) => {
        return {
          id: player_id,
          sortby: getPlayersSortValue(
            player_id,
            trendDate,
            trendDays,
            "player"
          ),
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
                trendDate,
                trendDays,
                "player"
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
      }),
    ...(filterPosition === "PI"
      ? Object.keys(pickshares).map((player_id) => {
          return {
            id: player_id,
            sortby: getPlayersSortValue(
              player_id,
              trendDate,
              trendDays,
              "pick"
            ),
            search: {
              text: player_id,
              display: <>{player_id}</>,
            },
            columns: [
              {
                text: player_id,
                colspan: 3,
                classname: sortPlayersBy.column === 0 ? "sort" : "",
              },
              ...[column1, column2, column3, column4].map((col, index) => {
                const { text, trendColor, classname } = getPlayersColumn(
                  col,
                  player_id,
                  trendDate,
                  trendDays,
                  "pick"
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
      : []),
  ].sort((a, b) =>
    sortPlayersBy.asc
      ? a.sortby > b.sortby
        ? 1
        : -1
      : a.sortby < b.sortby
      ? 1
      : -1
  );

  const teams = Array.from(
    new Set(
      (allplayers &&
        Object.keys(allplayers).map(
          (player_id) => allplayers?.[player_id]?.team
        )) ||
        []
    )
  );

  const yearsExps = Array.from(
    new Set(
      (allplayers &&
        Object.keys(playershares).map(
          (player_id) => allplayers?.[player_id]?.years_exp
        )) ||
        []
    )
  );

  const slots = Object.keys(position_map);

  const filters = (
    <div className="players-filters">
      <div>
        <label>Team</label>
        <select
          value={filterTeam}
          onChange={(e) =>
            dispatch(
              updatePlayersState({ key: "filterTeam", value: e.target.value })
            )
          }
        >
          <option value={""}>All</option>
          {teams
            .sort((a, b) => (a < b ? -1 : 1))
            .map((team) => {
              return <option key={team}>{team}</option>;
            })}
        </select>
      </div>
      <div>
        <label>Draft Class</label>
        <select
          value={filterDraftClass}
          onChange={(e) =>
            dispatch(
              updatePlayersState({
                key: "filterDraftClass",
                value: e.target.value,
              })
            )
          }
        >
          <option value={""}>All</option>
          {yearsExps
            .sort((a, b) => (a < b ? -1 : 1))
            .map((ye) => {
              return (
                <option key={ye} value={ye}>
                  {new Date().getFullYear() - ye}
                </option>
              );
            })}
        </select>
      </div>
      <div>
        <label>Position</label>
        <select
          value={filterPosition}
          onChange={(e) =>
            dispatch(
              updatePlayersState({
                key: "filterPosition",
                value: e.target.value,
              })
            )
          }
        >
          <option value={""}>Players</option>
          <option value={"PI"}>Picks</option>
          {slots.map((slot) => {
            return (
              <option key={slot} value={slot}>
                {getSlotAbbrev(slot)}
              </option>
            );
          })}
        </select>
      </div>
    </div>
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

  const trendColumns = [
    "KTC T",
    "KTC P",
    "KTC PD",
    "KTC L",
    "KTC LD",
    "Ppr Ppg",
    "# Gp",
    "Snp %",
  ];
  const component = (
    <>
      {filters}
      {[column1, column2, column3, column4].some((col) =>
        trendColumns.includes(col)
      ) && (
        <div
          className="trend-dates-wrapper"
          onBlur={() => {
            fetchKTCPeak();
            fetchKTCPrev();
            fetchStatsTrend();
          }}
          onMouseMove={() => {
            fetchKTCPeak();
            fetchKTCPrev();
            fetchStatsTrend();
          }}
          onMouseOut={() => {
            fetchKTCPeak();
            fetchKTCPrev();
            fetchStatsTrend();
          }}
        >
          <p>Select Date Range for Historical Values/Trends</p>

          <div className="trendDates">
            <span>
              <label>Start Date</label>
              <div className="calendar">
                <i className="fa-regular fa-calendar-days"></i>
                <input
                  type="date"
                  value={trendDate}
                  onChange={(e) =>
                    dispatch(
                      updatePlayersState({
                        key: "trendDate",
                        value: e.target.value,
                      })
                    )
                  }
                />
              </div>
            </span>
            <span>
              <label>Trend Days</label>
              <input
                className="trend-days"
                type="number"
                value={trendDays}
                onChange={(e) =>
                  dispatch(
                    updatePlayersState({
                      key: "trendDays",
                      value: parseInt(e.target.value),
                    })
                  )
                }
              />
            </span>
          </div>
          <p className="trend-range">{`${new Date(trendDate).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )} - ${
            trendDate2
              ? new Date(trendDate2).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : ""
          }`}</p>
        </div>
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
