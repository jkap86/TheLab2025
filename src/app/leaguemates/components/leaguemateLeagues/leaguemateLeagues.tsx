import SortIcon from "@/components/sortIcon/sortIcon";
import TableMain from "@/components/tableMain/tableMain";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateLeaguematesState } from "../../redux/leaguematesSlice";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import Avatar from "@/components/avatar/avatar";
import { getLeaguesColumn } from "@/utils/getLeaguesColumn";
import League from "@/components/league/league";

type LeaguemateLeaguesProps = {
  league_ids: string[];
};

const LeaguemateLeagues = ({ league_ids }: LeaguemateLeaguesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues } = useSelector((state: RootState) => state.user);
  const {
    column1_lmLeagues,
    column2_lmLeagues,
    column3_lmLeagues,
    column4_lmLeagues,
    sortLeaguemateLeaguesBy,
    activeLmLeague,
  } = useSelector((state: RootState) => state.leaguemates);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;

    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortLeaguemateLeaguesBy}
          setSortBy={(colNum, asc) => {
            dispatch(
              updateLeaguematesState({
                key: "sortLeaguemateLeaguesBy",
                value: { column: colNum, asc },
              })
            );
          }}
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortLeaguemateLeaguesBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "League",
      colspan: 3,
      classname: sortLeaguemateLeaguesBy.column === 0 ? "sort" : "",
    },
    ...[
      { var: column1_lmLeagues, key: "column1_owned" },
      { var: column2_lmLeagues, key: "column2_owned" },
      { var: column3_lmLeagues, key: "column3_owned" },
      { var: column4_lmLeagues, key: "column4_owned" },
    ].map((col, index) => {
      return {
        text: (
          <ColumnDropdown
            columnText={col.var}
            setColumnText={(value) =>
              dispatch(
                updateLeaguematesState({
                  key: col.key as
                    | "column1_lmLeagues"
                    | "column2_lmLeagues"
                    | "column3_lmLeagues"
                    | "column4_lmLeagues",
                  value,
                })
              )
            }
            options={[]}
          />
        ),
        colspan: 1,
        classname: sortLeaguemateLeaguesBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const data =
    (leagues &&
      league_ids.map((league_id) => {
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
              classname: sortLeaguemateLeaguesBy.column === 0 ? "sort" : "",
            },
            ...[
              column1_lmLeagues,
              column2_lmLeagues,
              column3_lmLeagues,
              column4_lmLeagues,
            ].map((col, index) => {
              const { text, trendColor } = getLeaguesColumn(
                col,
                leagues[league_id]
              );
              return {
                text,
                colspan: 1,
                style: trendColor,
                classname:
                  sortLeaguemateLeaguesBy.column === index + 1 ? "sort" : "",
              };
            }),
          ],
          secondary: <League type={3} league={leagues[league_id]} />,
        };
      })) ||
    [];

  const setActive = (activeLeague_id: string) =>
    dispatch(
      updateLeaguematesState({ key: "activeLmLeague", value: activeLeague_id })
    );

  return (
    <>
      <div className="nav"></div>
      <TableMain
        type={2}
        headers_sort={headers_sort}
        headers={headers}
        data={data}
        active={activeLmLeague}
        setActive={setActive}
      />
    </>
  );
};

export default LeaguemateLeagues;
