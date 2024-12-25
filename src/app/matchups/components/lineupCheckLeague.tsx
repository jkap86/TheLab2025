import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { updateMatchupsState } from "../redux/matchupsSlice";
import Avatar from "@/components/avatar/avatar";
import { getLcDetailColumn } from "../helpers/getLcDetailColumn";
import { position_map } from "@/utils/getOptimalStarters";
import { syncMatchup } from "@/redux/userActions";

const LineupCheckLeague = ({ league_id }: { league_id: string }) => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers, state: stateState } = useSelector(
    (state: RootState) => state.common
  );
  const { leagues, matchups, isSyncingMatchup } = useSelector(
    (state: RootState) => state.user
  );
  const { column1_lcd, column2_lcd, column3_lcd, column4_lcd, active_lcd } =
    useSelector((state: RootState) => state.matchups);

  const active_slot = active_lcd?.split("__")[0];

  const active_player_id =
    matchups?.[league_id].user.starters?.[parseInt(active_lcd.split("__")[1])];

  const options =
    matchups?.[league_id].user.players.filter(
      (player_id) =>
        !matchups[league_id].user.starters.includes(player_id) &&
        allplayers?.[player_id].fantasy_positions.some((fp) =>
          position_map[active_slot]?.includes(fp)
        )
    ) || [];

  const handleSync = () => {
    leagues &&
      dispatch(
        syncMatchup({
          league_id: league_id,
          week: stateState?.week as number,
          playoff_week_start: leagues[league_id]?.settings.playoff_week_start,
        })
      );
  };

  return (
    <>
      <div className="nav">
        <div></div>
        <div className="sync">
          <i
            className={
              "fa-solid fa-arrows-rotate " +
              (isSyncingMatchup === league_id ? "rotate" : "")
            }
            onClick={handleSync}
          ></i>
        </div>
        <div></div>
      </div>
      <TableMain
        type={2}
        half={true}
        headers={[
          {
            text: "Slot",
            colspan: 1,
          },
          {
            text: "Player",
            colspan: 3,
          },
          {
            text: (
              <ColumnDropdown
                options={[]}
                columnText={column1_lcd}
                setColumnText={(colValue) =>
                  dispatch(
                    updateMatchupsState({ key: "column1_lcd", value: colValue })
                  )
                }
              />
            ),
            colspan: 2,
          },
          {
            text: (
              <ColumnDropdown
                options={[]}
                columnText={column2_lcd}
                setColumnText={(colValue) =>
                  dispatch(
                    updateMatchupsState({ key: "column2_lcd", value: colValue })
                  )
                }
              />
            ),
            colspan: 2,
          },
        ]}
        data={(leagues?.[league_id]?.roster_positions || [])
          .filter((rp) => rp !== "BN")
          .map((rp, index) => {
            const player_id = matchups?.[league_id].user.starters[index] || "0";
            const optimal = matchups?.[
              league_id
            ].user.starters_optimal?.includes(player_id)
              ? ""
              : " red";
            return {
              id: `${rp}__${index}`,
              columns: [
                {
                  text: rp,
                  colspan: 1,
                  classname: optimal,
                },
                {
                  text:
                    (allplayers && player_id && allplayers[player_id] && (
                      <Avatar
                        id={player_id}
                        text={allplayers[player_id].full_name}
                        type="P"
                      />
                    )) ||
                    "-",
                  colspan: 3,
                  classname: optimal,
                },
                ...[column1_lcd, column2_lcd].map((col, index) => {
                  const { text, trendColor, classname } = getLcDetailColumn(
                    col,
                    league_id,
                    player_id
                  );

                  return {
                    text,
                    colspan: 2,
                    style: trendColor,
                    classname: classname + optimal,
                  };
                }),
              ],
            };
          })}
        active={active_lcd}
        setActive={(player_id) =>
          dispatch(updateMatchupsState({ key: "active_lcd", value: player_id }))
        }
      />
      {active_player_id ? (
        <TableMain
          type={2}
          half={true}
          headers={[
            {
              text: "Pos",
              colspan: 1,
            },
            {
              text: "Player",
              colspan: 3,
            },
            ...[
              { var: column3_lcd, key: "column3_lcd" },
              { var: column4_lcd, key: "column4_lcd" },
            ].map((col, index) => {
              return {
                text: (
                  <ColumnDropdown
                    options={[]}
                    columnText={col.var}
                    setColumnText={(colText) =>
                      dispatch(
                        updateMatchupsState({
                          key: col.key as "column3_lcd" | "column4_lcd",
                          value: colText,
                        })
                      )
                    }
                  />
                ),
                colspan: 2,
              };
            }),
          ]}
          data={options.map((player_id) => {
            return {
              id: player_id,
              columns: [
                {
                  text: allplayers?.[player_id].position,
                  colspan: 1,
                },
                {
                  text: (
                    <Avatar
                      id={player_id}
                      text={allplayers?.[player_id].full_name || player_id}
                      type="P"
                    />
                  ),
                  colspan: 3,
                },
                ...[column3_lcd, column4_lcd].map((col, index) => {
                  const { text, trendColor, classname } = getLcDetailColumn(
                    col,
                    league_id,
                    player_id
                  );

                  return {
                    text,
                    colspan: 2,
                    style: trendColor,
                    classname,
                  };
                }),
              ],
            };
          })}
        />
      ) : (
        <TableMain type={2} half={true} headers={[]} data={[]} />
      )}
    </>
  );
};

export default LineupCheckLeague;
