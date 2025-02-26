import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateMatchupsState } from "../redux/matchupsSlice";
import {
  columnOptionsLiveDetail,
  getLiveDetailColumn,
} from "../helpers/getLiveColumn";

const LiveLeague = ({ league_id }: { league_id: string }) => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { matchups, live_stats, leagues } = useSelector(
    (state: RootState) => state.user
  );
  const {
    column1_l_League,
    column2_l_League,
    column3_l_League,
    column4_l_League,
  } = useSelector((state: RootState) => state.matchups);

  const starters_user = leagues?.[league_id]?.settings.best_ball
    ? live_stats?.[league_id]?.starters_optimal_user
    : matchups?.[league_id]?.user.starters;

  const starters_opp = leagues?.[league_id]?.settings.best_ball
    ? live_stats?.[league_id]?.starters_optimal_opp
    : matchups?.[league_id]?.opp.starters;

  const data_user = [
    ...(
      leagues?.[league_id].roster_positions.filter((rp) => rp !== "BN") || []
    ).map((rp, index) => {
      const player_id = starters_user?.[index] || "0";

      const pct_left =
        live_stats?.[league_id].players[player_id]?.pct_left || 0;
      const inprogress =
        pct_left > 0 && pct_left < 1
          ? "inprogress"
          : pct_left === 1
          ? "pregame"
          : "complete";
      return {
        id: `${rp}__${index}`,
        columns: [
          {
            text: rp,
            colspan: 1,
            classname: inprogress,
          },
          {
            text: allplayers?.[player_id]?.full_name || "",
            colspan: 3,
            classname: inprogress,
          },
          ...[column1_l_League, column2_l_League].map((col) => {
            const { text, trendColor, classname } = getLiveDetailColumn(
              col,
              league_id,
              player_id
            );

            return {
              text,
              style: trendColor,
              classname: classname + " " + inprogress,
              colspan: 2,
            };
          }),
        ],
      };
    }),

    ...(matchups?.[league_id].user.players || [])
      .filter((player_id) => !starters_user?.includes(player_id))
      .map((player_id) => {
        const pct_left =
          live_stats?.[league_id].players[player_id]?.pct_left || 0;
        const inprogress =
          pct_left > 0 && pct_left < 1
            ? "inprogress"
            : pct_left === 1
            ? "pregame"
            : "complete";
        return {
          id: player_id,
          columns: [
            {
              text: "BN",
              colspan: 1,
              classname: inprogress,
            },
            {
              text: allplayers?.[player_id]?.full_name || "",
              colspan: 3,
              classname: inprogress,
            },
            ...[column1_l_League, column2_l_League].map((col) => {
              const { text, trendColor, classname } = getLiveDetailColumn(
                col,
                league_id,
                player_id
              );

              return {
                text,
                style: trendColor,
                classname: classname + " " + inprogress,
                colspan: 2,
              };
            }),
          ],
        };
      }),
  ];

  const data_opp = [
    ...(
      leagues?.[league_id].roster_positions.filter((rp) => rp !== "BN") || []
    ).map((rp, index) => {
      const starters = leagues?.[league_id]?.settings.best_ball
        ? live_stats?.[league_id]?.starters_optimal_opp
        : matchups?.[league_id]?.opp.starters;
      const player_id = starters?.[index] || "0";

      const pct_left =
        live_stats?.[league_id].players[player_id]?.pct_left || 0;

      const inprogress =
        pct_left > 0 && pct_left < 1
          ? "inprogress"
          : pct_left === 1
          ? "pregame"
          : "complete";

      return {
        id: `${rp}__${index}`,
        columns: [
          {
            text: rp,
            colspan: 1,
            classname: inprogress,
          },
          {
            text: allplayers?.[player_id]?.full_name || "",
            colspan: 3,
            classname: inprogress,
          },
          ...[column1_l_League, column2_l_League].map((col) => {
            const { text, trendColor, classname } = getLiveDetailColumn(
              col,
              league_id,
              player_id
            );

            return {
              text,
              style: trendColor,
              classname: classname + " " + inprogress,
              colspan: 2,
            };
          }),
        ],
      };
    }),

    ...(matchups?.[league_id].opp.players || [])
      .filter((player_id) => !starters_opp?.includes(player_id))
      .map((player_id) => {
        const pct_left =
          live_stats?.[league_id].players[player_id]?.pct_left || 0;
        const inprogress =
          pct_left > 0 && pct_left < 1
            ? "inprogress"
            : pct_left === 1
            ? "pregame"
            : "complete";
        return {
          id: player_id,
          columns: [
            {
              text: "BN",
              colspan: 1,
              classname: inprogress,
            },
            {
              text: allplayers?.[player_id]?.full_name || "",
              colspan: 3,
              classname: inprogress,
            },
            ...[column1_l_League, column2_l_League].map((col) => {
              const { text, trendColor, classname } = getLiveDetailColumn(
                col,
                league_id,
                player_id
              );

              return {
                text,
                style: trendColor,
                classname: classname + " " + inprogress,
                colspan: 2,
              };
            }),
          ],
        };
      }),
  ];

  return (
    <>
      <div className="nav"></div>
      <TableMain
        type={2}
        half={true}
        headers={[
          { text: "S", colspan: 1 },
          { text: "Player", colspan: 3 },
          {
            text: (
              <ColumnDropdown
                columnText={column1_l_League}
                setColumnText={(colText) =>
                  dispatch(
                    updateMatchupsState({
                      key: "column1_l_League",
                      value: colText,
                    })
                  )
                }
                options={columnOptionsLiveDetail}
              />
            ),
            colspan: 2,
          },
          {
            text: (
              <ColumnDropdown
                columnText={column2_l_League}
                setColumnText={(colText) =>
                  dispatch(
                    updateMatchupsState({
                      key: "column2_l_League",
                      value: colText,
                    })
                  )
                }
                options={columnOptionsLiveDetail}
              />
            ),
            colspan: 2,
          },
        ]}
        data={data_user}
      />
      <TableMain
        type={2}
        half={true}
        headers={[
          { text: "S", colspan: 1 },
          { text: "Player", colspan: 3 },
          {
            text: (
              <ColumnDropdown
                columnText={column3_l_League}
                setColumnText={(colText) =>
                  dispatch(
                    updateMatchupsState({
                      key: "column3_l_League",
                      value: colText,
                    })
                  )
                }
                options={columnOptionsLiveDetail}
              />
            ),
            colspan: 2,
          },
          {
            text: (
              <ColumnDropdown
                columnText={column4_l_League}
                setColumnText={(colText) =>
                  dispatch(
                    updateMatchupsState({
                      key: "column4_l_League",
                      value: colText,
                    })
                  )
                }
                options={columnOptionsLiveDetail}
              />
            ),
            colspan: 2,
          },
        ]}
        data={data_opp}
      />
    </>
  );
};

export default LiveLeague;
