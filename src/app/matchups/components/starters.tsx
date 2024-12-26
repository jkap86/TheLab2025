import Avatar from "@/components/avatar/avatar";
import SortIcon from "@/components/sortIcon/sortIcon";
import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateMatchupsState } from "../redux/matchupsSlice";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import {
  getStartersColumn,
  getStartersSortValue,
  starterColumnOptions,
} from "../helpers/getStartersColumn";
import StarterLeagues from "./starterLeagues";

const Starters = () => {
  const dispatch: AppDispatch = useDispatch();
  const { allplayers } = useSelector((state: RootState) => state.common);
  const { matchups, leagues } = useSelector((state: RootState) => state.user);
  const {
    column1_s,
    column2_s,
    column3_s,
    column4_s,
    sortStartersBy,
    active_s,
  } = useSelector((state: RootState) => state.matchups);

  const starters_obj = useMemo(() => {
    const user: { [key: string]: { start: string[]; bench: string[] } } = {};
    const opp: { [key: string]: { start: string[]; bench: string[] } } = {};

    if (matchups && leagues) {
      Object.keys(matchups).forEach((league_id) => {
        matchups[league_id].user.players.forEach((player_id) => {
          if (!user[player_id]) {
            user[player_id] = { start: [], bench: [] };
          }

          if (matchups[league_id].user.starters?.includes(player_id)) {
            user[player_id].start.push(league_id);
          } else {
            user[player_id].bench.push(league_id);
          }
        });

        matchups[league_id].opp.players.forEach((player_id) => {
          if (!opp[player_id]) {
            opp[player_id] = { start: [], bench: [] };
          }

          if (matchups[league_id].opp.starters?.includes(player_id)) {
            opp[player_id].start.push(league_id);
          } else {
            opp[player_id].bench.push(league_id);
          }
        });
      });
    }
    return { user, opp };
  }, [matchups, leagues]);

  const player_ids = Array.from(
    new Set([
      ...Object.keys(starters_obj.user),
      ...Object.keys(starters_obj.opp),
    ])
  );

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;
    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortStartersBy}
          setSortBy={(colNum, asc) =>
            dispatch(
              updateMatchupsState({
                key: "sortStartersBy",
                value: { column: colNum, asc: asc },
              })
            )
          }
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortStartersBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "Player",
      colspan: 3,
      classname: sortStartersBy.column === 0 ? "sort" : "",
    },
    ...[
      { var: column1_s, key: "column1_s" },
      { var: column2_s, key: "column2_s" },
      { var: column3_s, key: "column3_s" },
      { var: column4_s, key: "column4_s" },
    ].map((col, index) => {
      return {
        text: (
          <ColumnDropdown
            columnText={col.var}
            setColumnText={(value) =>
              dispatch(
                updateMatchupsState({
                  key: col.key as
                    | "column1_s"
                    | "column2_s"
                    | "column3_s"
                    | "column4_s",
                  value,
                })
              )
            }
            options={starterColumnOptions}
          />
        ),
        colspan: 1,
        classname: sortStartersBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const data = player_ids
    .sort((a, b) => {
      return getStartersSortValue(
        {
          user: starters_obj.user[a],
          opp: starters_obj.opp[a],
        },
        a
      ) >
        getStartersSortValue(
          {
            user: starters_obj.user[b],
            opp: starters_obj.opp[b],
          },
          b
        )
        ? -1
        : 1;
    })
    .map((player_id) => {
      return {
        id: player_id,
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
            classname: "",
          },
          ...[column1_s, column2_s, column3_s, column4_s].map((col, index) => {
            const { text, trendColor, classname } = getStartersColumn(col, {
              user: starters_obj.user[player_id],
              opp: starters_obj.opp[player_id],
            });

            return {
              text,
              colspan: 1,
              style: trendColor,
              classname:
                sortStartersBy.column === index + 1
                  ? "sort " + classname
                  : classname,
            };
          }),
          /*
        {
          text: filterLeagueIds(
            starters_obj.user[player_id]?.start || [],
            true
          ).length.toString(),
          colspan: 1,
          classname: "",
        },
        {
          text: filterLeagueIds(
            starters_obj.user[player_id]?.bench || [],
            true
          ).length.toString(),
          colspan: 1,
          classname: "",
        },
        {
          text: filterLeagueIds(
            starters_obj.opp[player_id]?.start || [],
            true
          ).length.toString(),
          colspan: 1,
          classname: "",
        },
        {
          text: filterLeagueIds(
            starters_obj.opp[player_id]?.bench || [],
            true
          ).length.toString(),
          colspan: 1,
          classname: "",
        },
        */
        ],
        secondary: (
          <StarterLeagues
            player_id={player_id}
            player_obj={{
              user: starters_obj.user[player_id],
              opp: starters_obj.opp[player_id],
            }}
          />
        ),
      };
    });

  return (
    <TableMain
      type={1}
      headers_sort={headers_sort}
      headers={headers}
      data={data}
      active={active_s}
      setActive={(id) =>
        dispatch(updateMatchupsState({ key: "active_s", value: id }))
      }
    />
  );
};

export default Starters;
