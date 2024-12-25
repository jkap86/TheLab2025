import { User } from "@/lib/types/userTypes";
import "./playerLeagues.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateState } from "../../redux/playersSlice";
import TableMain from "@/components/tableMain/tableMain";
import { getLeaguesColumn } from "@/utils/getLeaguesColumn";
import Avatar from "@/components/avatar/avatar";
import SortIcon from "@/components/sortIcon/sortIcon";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import League from "@/components/league/league";

type PlayerLeaguesProps = {
  player_obj: {
    available: string[];
    owned: string[];
    taken: {
      league_id: string;
      lm_roster_id: number;
      lm: User;
    }[];
  };
};

const PlayerLeagues = ({ player_obj }: PlayerLeaguesProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { playerLeaguesTab } = useSelector((state: RootState) => state.players);

  return (
    <>
      <div className="nav">
        {["Owned", "Taken", "Available"].map((text) => {
          return (
            <button
              key={text}
              className={playerLeaguesTab === text ? "active" : ""}
              onClick={() =>
                dispatch(updateState({ key: "playerLeaguesTab", value: text }))
              }
            >
              {text}
            </button>
          );
        })}
      </div>

      {playerLeaguesTab === "Owned" ? (
        <Owned league_ids={player_obj.owned} />
      ) : playerLeaguesTab === "Taken" ? null : null}
    </>
  );
};

type OwnedProps = {
  league_ids: string[];
};
const Owned = ({ league_ids }: OwnedProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues } = useSelector((state: RootState) => state.user);
  const {
    column1_owned,
    column2_owned,
    column3_owned,
    column4_owned,
    sortOwnedBy,
    activeOwned,
  } = useSelector((state: RootState) => state.players);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;

    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortOwnedBy}
          setSortBy={(colNum, asc) => {
            dispatch(
              updateState({
                key: "sortOwnedBy",
                value: { column: colNum, asc },
              })
            );
          }}
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortOwnedBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "League",
      colspan: 3,
      classname: sortOwnedBy.column === 0 ? "sort" : "",
    },
    ...[
      { var: column1_owned, key: "column1_owned" },
      { var: column2_owned, key: "column2_owned" },
      { var: column3_owned, key: "column3_owned" },
      { var: column4_owned, key: "column4_owned" },
    ].map((col, index) => {
      return {
        text: (
          <ColumnDropdown
            columnText={col.var}
            setColumnText={(value) =>
              dispatch(
                updateState({
                  key: col.key as
                    | "column1_owned"
                    | "column2_owned"
                    | "column3_owned"
                    | "column4_owned",
                  value,
                })
              )
            }
            options={[]}
          />
        ),
        colspan: 1,
        classname: sortOwnedBy.column === index + 1 ? "sort" : "",
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
                  id={leagues?.[league_id].avatar}
                  text={leagues?.[league_id].name || "-"}
                  type="L"
                />
              ),
              colspan: 3,
              classname: sortOwnedBy.column === 0 ? "sort" : "",
            },
            ...[column1_owned, column2_owned, column3_owned, column4_owned].map(
              (col, index) => {
                const { text, trendColor } = getLeaguesColumn(
                  col,
                  leagues[league_id]
                );

                return {
                  text,
                  colspan: 1,
                  style: trendColor,
                  classname: sortOwnedBy.column === index + 1 ? "sort" : "",
                };
              }
            ),
          ],
          secondary: leagues && <League league={leagues[league_id]} type={3} />,
        };
      })) ||
    [];

  const setActive = (league_id: string) => {
    dispatch(updateState({ key: "activeOwned", value: league_id }));
  };

  return (
    <TableMain
      type={2}
      headers_sort={headers_sort}
      headers={headers}
      data={data}
      active={activeOwned}
      setActive={setActive}
    />
  );
};

export default PlayerLeagues;
