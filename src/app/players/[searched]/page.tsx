"use client";

import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { use, useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateState as updatePlayersState } from "../redux/playersSlice";
import { updateState } from "@/redux/commonSlice";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import { columnOptions, getPlayersSortValue } from "../helpers/playersColumn";
import SortIcon from "@/components/sortIcon/sortIcon";
import Avatar from "@/components/avatar/avatar";
import PlayerLeagues from "../components/playerLeagues/playerLeagues";
import LoadCommonData from "@/components/loadCommonData/loadCommonData";
import axios from "axios";
import "../players.css";
import { getSlotAbbrev, position_map } from "@/utils/getOptimalStarters";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { getTrendColor_Range } from "@/utils/getTrendColor";
import { getPositionMaxAge } from "@/utils/getPositionMaxAge";

interface PlayersProps {
  params: Promise<{ searched: string }>;
}

type colObj = {
  sort: number | string;
  text: string | JSX.Element;
  trendColor: { [key: string]: string };
  classname: string;
};

type PlayersObj = {
  [key: string]: colObj;
};

const Players = ({ params }: PlayersProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { searched } = use(params);
  const {
    allplayers,
    type1,
    type2,
    ktc_current,
    ktc_trend,
    ktc_peak,
    isLoadingKtcPeak,
    isLoadingKtcTrend,
    isLoadingStatsTrend,
    stats_trend,
  } = useSelector((state: RootState) => state.common);
  const { playershares, pickshares, leagues } = useSelector(
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
    const newTrendDate2 =
      new Date(trendDate).getTime() + 1000 * 60 * 60 * 24 * trendDays;

    const now = new Date().getTime();

    return (
      (trendDate &&
        trendDays &&
        new Date(Math.min(newTrendDate2, now)).toISOString().split("T")[0]) ||
      new Date(now).toISOString().split("T")[0]
    );
  }, [trendDate, trendDays]);

  const playersObj = useMemo(() => {
    const obj: {
      [player_id: string]: PlayersObj;
    } = {};

    Object.keys(playershares).forEach((player_id) => {
      const numOwned = filterLeagueIds(playershares[player_id].owned).length;
      const percentOwned =
        (leagues && numOwned / filterLeagueIds(Object.keys(leagues)).length) ||
        0;
      const ktc = ktc_current?.[player_id] || 0;

      const ktcTrend =
        (ktc_trend.date === trendDate &&
          ktc_trend.days === trendDays &&
          ktc_trend.values?.[player_id]) ||
        0;

      const age = allplayers?.[player_id]?.age || 999;

      const ktcPeak =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          ktc_peak.max_values[player_id]?.value) ||
        0;

      const ktcPeakDate =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          ktc_peak.max_values[player_id]?.date) ||
        "-";

      const ktcLow =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          ktc_peak.min_values[player_id]?.value) ||
        0;

      const ktcLowDate =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          new Date(ktc_peak.min_values[player_id]?.date)) ||
        "-";

      const ppr_ppg =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? (stats_trend.values[player_id]?.pts_ppr || 0) /
            stats_trend.values[player_id].gp
          : 0;

      const gp = stats_trend.values[player_id]?.gp || 0;

      const snaps = stats_trend.values[player_id]?.off_snp || 0;
      const snaps_team = stats_trend.values[player_id]?.tm_off_snp;
      const snp_pct = snaps_team > 0 ? (snaps / snaps_team) * 100 : 0;

      const pass_att =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.pass_att || 0
          : 0;

      const rush_att =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.rush_att || 0
          : 0;

      const rec =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.rec || 0
          : 0;

      const rec_tgt =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.rec_tgt || 0
          : 0;

      const pass_yd =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.pass_yd || 0
          : 0;

      const rush_yd =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.rush_yd || 0
          : 0;

      const rec_yd =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.rec_yd || 0
          : 0;

      const pass_td =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.pass_td || 0
          : 0;

      const rush_td =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.rush_td || 0
          : 0;

      const rec_td =
        (stats_trend.values[player_id]?.gp || 0) > 0
          ? stats_trend.values[player_id]?.rec_td || 0
          : 0;

      obj[player_id] = {
        "# Own": {
          sort: numOwned,
          text: numOwned.toString(),
          trendColor: getTrendColor_Range(
            numOwned / filterLeagueIds(Object.keys(leagues || {})).length,
            0,
            0.25
          ),
          classname: "age",
        },
        "% Own": {
          sort: percentOwned,
          text: Math.round(percentOwned * 100) + "%",
          trendColor: getTrendColor_Range(numOwned, 0, 0.25),
          classname: "percentage",
        },
        Age: {
          sort: age,
          text: (age !== 999 && age.toString()) || "-",
          trendColor: getTrendColor_Range(
            parseInt(allplayers?.[player_id]?.age || "0"),
            21,
            getPositionMaxAge(allplayers?.[player_id]?.position),
            true
          ),
          classname: "age",
        },
        KTC: {
          sort: ktc,
          text: ktc.toString(),
          trendColor: getTrendColor_Range(ktc, 1000, 8000),
          classname: "ktc",
        },
        "KTC T": {
          sort: ktcTrend,
          text: isLoadingKtcTrend
            ? "LOADING"
            : ktc_trend.date === trendDate && ktc_trend.days === trendDays
            ? ktc_trend.values?.[player_id]?.toString()
            : "-",
          trendColor: isLoadingKtcTrend
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ktcTrend, -500, 500),
          classname: "ktc",
        },
        "KTC P": {
          sort: ktcPeak,
          text: isLoadingKtcPeak ? "LOADING" : ktcPeak.toString(),
          trendColor: isLoadingKtcPeak
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ktcPeak, 1000, 8000),
          classname: "ktc",
        },
        "KTC PD": {
          sort: new Date(ktcPeakDate).getTime(),
          text: isLoadingKtcPeak
            ? "LOADING"
            : new Date(ktcPeakDate).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "numeric",
                day: "numeric",
              }),
          trendColor: isLoadingKtcPeak ? { color: `rgb(100, 255, 255)` } : {},
          classname: "date",
        },
        "KTC L": {
          sort: ktcLow,
          text: isLoadingKtcPeak ? "LOADING" : ktcLow.toString(),
          trendColor: isLoadingKtcPeak
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ktcLow, 1000, 8000),
          classname: "ktc",
        },
        "KTC LD": {
          sort: new Date(ktcLowDate).getTime(),
          text: isLoadingKtcPeak
            ? "LOADING"
            : new Date(ktcLowDate).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "numeric",
                day: "numeric",
              }),
          trendColor: isLoadingKtcPeak ? { color: `rgb(100, 255, 255)` } : {},
          classname: "date",
        },
        "Ppr Ppg": {
          sort: ppr_ppg,
          text: isLoadingStatsTrend
            ? "LOADING"
            : ppr_ppg.toLocaleString("en-US", { maximumFractionDigits: 1 }),
          trendColor: isLoadingStatsTrend
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ppr_ppg, 5, 15),
          classname: "fp",
        },
        "# Gp": {
          sort: gp,
          text: isLoadingStatsTrend ? "LOADING" : gp.toString(),
          trendColor: isLoadingStatsTrend
            ? { color: `rgb(100, 255, 255)` }
            : {},
          classname: "fp",
        },
        "Snp %": {
          sort: snp_pct,
          text: isLoadingStatsTrend
            ? "LOADING"
            : snp_pct.toLocaleString("en-US", { maximumFractionDigits: 0 }) +
              "%",
          trendColor: getTrendColor_Range(snp_pct, 25, 75),
          classname: "percentage",
        },
        "Pass Att": {
          sort: pass_att,
          text: isLoadingStatsTrend
            ? "LOADING"
            : pass_att.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(pass_att / gp, 20, 35),
          classname: "stat",
        },
        "Rush Att": {
          sort: rush_att,
          text: isLoadingStatsTrend
            ? "LOADING"
            : rush_att.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(rush_att / gp, 5, 15),
          classname: "stat",
        },
        Tgt: {
          sort: rec_tgt,
          text: isLoadingStatsTrend
            ? "LOADING"
            : rec_tgt.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(rec_tgt / gp, 2, 10),
          classname: "stat",
        },
        Rec: {
          sort: rec,
          text: isLoadingStatsTrend
            ? "LOADING"
            : rec.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(rec / gp, 0, 8),
          classname: "stat",
        },
        "Pass Yds": {
          sort: pass_yd,
          text: isLoadingStatsTrend
            ? "LOADING"
            : pass_yd.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(pass_yd / gp, 150, 300),
          classname: "stat",
        },
        "Rush Yds": {
          sort: rush_yd,
          text: isLoadingStatsTrend
            ? "LOADING"
            : rush_yd.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(rush_yd, 25, 100),
          classname: "stat",
        },
        "Rec Yds": {
          sort: rec_yd,
          text: isLoadingStatsTrend
            ? "LOADING"
            : rec_yd.toLocaleString("en-US", { maximumFractionDigits: 0 }),
          trendColor: getTrendColor_Range(rec_yd, 25, 100),
          classname: "stat",
        },
        "Pass Td": {
          sort: pass_td,
          text: isLoadingStatsTrend ? "LOADING" : pass_td.toString(),
          trendColor: getTrendColor_Range(pass_td, 150, 300),
          classname: "fp",
        },
        "Rush Td": {
          sort: rush_td,
          text: isLoadingStatsTrend ? "LOADING" : rush_td.toString(),
          trendColor: getTrendColor_Range(rush_td, 25, 100),
          classname: "fp",
        },
        "Rec Td": {
          sort: rec_td,
          text: isLoadingStatsTrend ? "LOADING" : rec_td.toString(),
          trendColor: getTrendColor_Range(rec_td, 25, 100),
          classname: "fp",
        },
        "Tgt %": {
          sort: snaps > 0 ? rec_tgt / snaps : 0,
          text: isLoadingStatsTrend
            ? "LOADING"
            : snaps > 0
            ? ((rec_tgt / snaps) * 100).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              }) + "%"
            : "-",
          trendColor: getTrendColor_Range(rec_tgt / snaps, 0, 0.2),
          classname: "percentage",
        },
      };
    });

    Object.keys(pickshares).forEach((pick_id) => {
      const numOwned = filterLeagueIds(pickshares[pick_id].owned).length;
      const percentOwned =
        (leagues && numOwned / filterLeagueIds(Object.keys(leagues)).length) ||
        0;
      const ktc = ktc_current?.[pick_id] || 0;

      const ktcTrend =
        (ktc_trend.date === trendDate &&
          ktc_trend.days === trendDays &&
          ktc_trend.values?.[pick_id]) ||
        0;

      const age: number = 0;

      const ktcPeak =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          ktc_peak.max_values[pick_id]?.value) ||
        0;

      const ktcPeakDate =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          ktc_peak.max_values[pick_id]?.date) ||
        "-";

      const ktcLow =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          ktc_peak.min_values[pick_id]?.value) ||
        0;

      const ktcLowDate =
        (ktc_peak.date === trendDate &&
          ktc_peak.days === trendDays &&
          new Date(ktc_peak.min_values[pick_id]?.date)) ||
        "-";

      const ppr_ppg = 0;

      const gp = 0;

      const snp_pct = 0;

      obj[pick_id] = {
        "# Own": {
          sort: numOwned,
          text: numOwned.toString(),
          trendColor: getTrendColor_Range(
            numOwned / filterLeagueIds(Object.keys(leagues || {})).length,
            0,
            0.25
          ),
          classname: "age",
        },
        "% Own": {
          sort: percentOwned,
          text: Math.round(percentOwned * 100) + "%",
          trendColor: getTrendColor_Range(numOwned, 0, 0.25),
          classname: "percentage",
        },
        Age: {
          sort: age,
          text: (age !== 999 && age.toString()) || "-",
          trendColor: getTrendColor_Range(
            parseInt(allplayers?.[pick_id]?.age || "0"),
            21,
            getPositionMaxAge(allplayers?.[pick_id]?.position),
            true
          ),
          classname: "age",
        },
        KTC: {
          sort: ktc,
          text: ktc.toString(),
          trendColor: getTrendColor_Range(ktc, 1000, 8000),
          classname: "ktc",
        },
        "KTC T": {
          sort: ktcTrend,
          text: isLoadingKtcTrend
            ? "LOADING"
            : (
                ktc_trend.date === trendDate &&
                ktc_trend.days === trendDays &&
                (ktc_trend.values?.[pick_id] || 0)
              ).toString() || "-",
          trendColor: isLoadingKtcTrend
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ktcTrend, -500, 500),
          classname: "ktc",
        },
        "KTC P": {
          sort: ktcPeak,
          text: ktcPeak.toString(),
          trendColor: isLoadingKtcPeak
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ktcPeak, 1000, 8000),
          classname: "ktc",
        },
        "KTC PD": {
          sort: new Date(ktcPeakDate).getTime(),
          text: new Date(ktcPeakDate).toLocaleDateString("en-US", {
            year: "2-digit",
            month: "numeric",
            day: "numeric",
          }),
          trendColor: isLoadingKtcPeak ? { color: `rgb(100, 255, 255)` } : {},
          classname: "date",
        },
        "KTC L": {
          sort: ktcLow,
          text: ktcLow.toString(),
          trendColor: isLoadingKtcPeak
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ktcLow, 1000, 8000),
          classname: "ktc",
        },
        "KTC LD": {
          sort: new Date(ktcLowDate).getTime(),
          text: new Date(ktcLowDate).toLocaleDateString("en-US", {
            year: "2-digit",
            month: "numeric",
            day: "numeric",
          }),
          trendColor: isLoadingKtcPeak ? { color: `rgb(100, 255, 255)` } : {},
          classname: "date",
        },
        "Ppr Ppg": {
          sort: ppr_ppg,
          text: ppr_ppg.toLocaleString("en-US", { maximumFractionDigits: 1 }),
          trendColor: isLoadingStatsTrend
            ? { color: `rgb(100, 255, 255)` }
            : getTrendColor_Range(ppr_ppg, 5, 15),
          classname: "fp",
        },
        "# Gp": {
          sort: gp,
          text: gp.toString(),
          trendColor: isLoadingStatsTrend
            ? { color: `rgb(100, 255, 255)` }
            : {},
          classname: "fp",
        },
        "Snp %": {
          sort: snp_pct,
          text: isLoadingStatsTrend
            ? "LOADING"
            : snp_pct.toLocaleString("en-US", { maximumFractionDigits: 0 }) +
              "%",
          trendColor: getTrendColor_Range(snp_pct, 25, 75),
          classname: "percentage",
        },
        "Pass Yds": {
          sort: 0,
          text: "-",
          trendColor: {},
          classname: "fp",
        },
      };
    });

    return obj;
  }, [
    playershares,
    allplayers,
    isLoadingKtcPeak,
    isLoadingKtcTrend,
    isLoadingStatsTrend,
    ktc_current,
    ktc_peak,
    ktc_trend,
    leagues,
    pickshares,
    stats_trend,
    trendDate,
    trendDays,
    type1,
    type2,
  ]);

  const fetchKTCPrev = useCallback(async () => {
    if (
      !isLoadingKtcTrend &&
      trendDate &&
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
        const col = [column1, column2, column3, column4][
          sortPlayersBy.column - 1
        ];
        const { sort } = playersObj[player_id][col] || {};
        return {
          id: player_id,
          sortby: sort,
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
              /*
              const { text, trendColor, classname } = getPlayersColumn(
                col,
                player_id,
                trendDate,
                trendDays,
                "player"
              );
              */

              const { text, trendColor, classname } =
                playersObj[player_id][col as keyof PlayersObj] || {};

              return {
                text: text || "-",
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
                /*
                const { text, trendColor, classname } = getPlayersColumn(
                  col,
                  player_id,
                  trendDate,
                  trendDays,
                  "pick"
                );
                */

                const { text, trendColor, classname } =
                  playersObj[player_id][col as keyof PlayersObj] || {};

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
            secondary: <PlayerLeagues player_obj={pickshares[player_id]} />,
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
        Object.keys(playershares)
          .filter((player_id) => allplayers?.[player_id]?.years_exp)
          .map((player_id) => allplayers?.[player_id]?.years_exp)) ||
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
        trendColumns.some(
          (tcol) => col === tcol || col.includes("Yd") || col.includes("Td")
        )
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
          <p className="info">Select Date Range for Historical Values/Trends</p>

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
                      value: parseInt(e.target.value) || "",
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
