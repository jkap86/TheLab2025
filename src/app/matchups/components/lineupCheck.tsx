import { useSelector, useDispatch } from "react-redux";
import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import { updateMatchupsState } from "../redux/matchupsSlice";
import { filterLeagueIds } from "@/utils/filterLeagues";
import Avatar from "@/components/avatar/avatar";
import { getMatchupsColumn } from "../helpers/getMatchupsColumn";
import LineupCheckLeague from "./lineupCheckLeague";

const LineupCheck = () => {
  const dispatch: AppDispatch = useDispatch();
  const { matchups, leagues } = useSelector((state: RootState) => state.user);
  const { column1_lc, column2_lc, column3_lc, column4_lc, page_lc, active_lc } =
    useSelector((state: RootState) => state.matchups);

  const headers = [
    {
      text: "League",
      colspan: 3,
    },
    ...[
      { var: column1_lc, key: "column1_lc" },
      { var: column2_lc, key: "column2_lc" },
      { var: column3_lc, key: "column3_lc" },
      { var: column4_lc, key: "column4_lc" },
    ].map((col) => {
      return {
        text: (
          <ColumnDropdown
            columnText={col.var}
            setColumnText={(value) =>
              dispatch(
                updateMatchupsState({
                  key: col.key as
                    | "column1_lc"
                    | "column2_lc"
                    | "column3_lc"
                    | "column4_lc",
                  value,
                })
              )
            }
            options={[]}
          />
        ),
        colspan: 1,
      };
    }),
  ];

  const data =
    (leagues &&
      matchups &&
      filterLeagueIds(Object.keys(matchups))
        .sort((a, b) => leagues[a].index - leagues[b].index)
        .map((league_id) => {
          const playoffs = matchups[league_id].user.playoffs_alive?.includes(
            leagues[league_id].userRoster.roster_id
          );
          return {
            id: league_id,
            columns: [
              {
                text: (
                  <Avatar
                    id={leagues[league_id].avatar}
                    text={leagues[league_id].name}
                    type="L"
                  />
                ),
                colspan: 3,
                classname: playoffs ? "playoffs" : "",
              },
              ...[column1_lc, column2_lc, column3_lc, column4_lc].map((col) => {
                const { text, trendColor, classname } = getMatchupsColumn(
                  col,
                  league_id
                );

                return {
                  text,
                  colspan: 1,
                  style: trendColor,
                  classname: classname,
                };
              }),
            ],
            secondary: <LineupCheckLeague league_id={league_id} />,
          };
        })) ||
    [];

  return (
    <TableMain
      type={1}
      headers={headers}
      data={data}
      page={page_lc}
      setPage={(pageNum) =>
        dispatch(updateMatchupsState({ key: "page_lc", value: pageNum }))
      }
      active={active_lc}
      setActive={(active) =>
        dispatch(updateMatchupsState({ key: "active_lc", value: active }))
      }
    />
  );
};

export default LineupCheck;
