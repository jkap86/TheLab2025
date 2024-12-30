import { User } from "@/lib/types/userTypes";
import "./playerLeagues.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateState } from "../../redux/playersSlice";
import TableMain from "@/components/tableMain/tableMain";
import {
  getLeaguesColumn,
  getLeaguesColumnSortValue,
  leaguesColumnOptions,
} from "@/utils/getLeaguesColumn";
import Avatar from "@/components/avatar/avatar";
import SortIcon from "@/components/sortIcon/sortIcon";
import ColumnDropdown from "@/components/columnDropdown/columnDropdown";
import League from "@/components/league/league";
import { filterLeagueIds } from "@/utils/filterLeagues";
import { useMemo } from "react";

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
      ) : playerLeaguesTab === "Taken" ? (
        <Taken leagues_taken={player_obj.taken} />
      ) : (
        <Available league_ids={player_obj.available} />
      )}
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
    page_owned,
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
            options={leaguesColumnOptions}
          />
        ),
        colspan: 1,
        classname: sortOwnedBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const data =
    (leagues &&
      filterLeagueIds(league_ids)
        .sort((a, b) => {
          const a_sortValue = getLeaguesColumnSortValue(
            leagues[a],
            sortOwnedBy,
            [column1_owned, column2_owned, column3_owned, column4_owned]
          );
          const b_sortValue = getLeaguesColumnSortValue(
            leagues[b],
            sortOwnedBy,
            [column1_owned, column2_owned, column3_owned, column4_owned]
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
              ...[
                column1_owned,
                column2_owned,
                column3_owned,
                column4_owned,
              ].map((col, index) => {
                const { text, trendColor, classname } = getLeaguesColumn(
                  col,
                  leagues[league_id]
                );

                return {
                  text,
                  colspan: 1,
                  style: trendColor,
                  classname:
                    (sortOwnedBy.column === index + 1 ? "sort " : "") +
                    classname,
                };
              }),
            ],
            secondary: leagues && (
              <League league={leagues[league_id]} type={3} />
            ),
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
      page={page_owned}
      setPage={(p) => dispatch(updateState({ key: "page_owned", value: p }))}
    />
  );
};

type TakenProps = {
  leagues_taken: {
    lm_roster_id: number;
    lm: User;
    league_id: string;
  }[];
};

const Taken = ({ leagues_taken }: TakenProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues } = useSelector((state: RootState) => state.user);
  const {
    column1_taken,
    column2_taken,
    column3_taken,
    column4_taken,
    sortTakenBy,
    activeTaken,
    page_taken,
  } = useSelector((state: RootState) => state.players);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;

    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortTakenBy}
          setSortBy={(colNum, asc) => {
            dispatch(
              updateState({
                key: "sortTakenBy",
                value: { column: colNum, asc },
              })
            );
          }}
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortTakenBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "League",
      colspan: 3,
      classname: sortTakenBy.column === 0 ? "sort" : "",
    },
    ...[
      { var: column1_taken, key: "column1_taken" },
      { var: column2_taken, key: "column2_taken" },
      { var: column3_taken, key: "column3_taken" },
      { var: column4_taken, key: "column4_taken" },
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
            options={leaguesColumnOptions}
          />
        ),
        colspan: 1,
        classname: sortTakenBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const takenObj = useMemo(() => {
    return Object.fromEntries(leagues_taken.map((l) => [l.league_id, l]));
  }, [leagues_taken]);

  const data =
    (leagues &&
      filterLeagueIds(Object.keys(takenObj))
        .sort((a, b) => {
          const a_sortValue = getLeaguesColumnSortValue(
            leagues[a],
            sortTakenBy,
            [column1_taken, column2_taken, column3_taken, column4_taken]
          );
          const b_sortValue = getLeaguesColumnSortValue(
            leagues[b],
            sortTakenBy,
            [column1_taken, column2_taken, column3_taken, column4_taken]
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
                classname: sortTakenBy.column === 0 ? "sort" : "",
              },
              ...[
                column1_taken,
                column2_taken,
                column3_taken,
                column4_taken,
              ].map((col, index) => {
                const { text, trendColor, classname } = getLeaguesColumn(
                  col,
                  leagues[league_id]
                );

                return {
                  text,
                  colspan: 1,
                  style: trendColor,
                  classname:
                    (sortTakenBy.column === index + 1 ? "sort " : "") +
                    classname,
                };
              }),
            ],
            secondary: leagues && (
              <League league={leagues[league_id]} type={3} />
            ),
          };
        })) ||
    [];

  const setActive = (league_id: string) => {
    dispatch(updateState({ key: "activeTaken", value: league_id }));
  };

  return (
    <TableMain
      type={2}
      headers_sort={headers_sort}
      headers={headers}
      data={data}
      active={activeTaken}
      setActive={setActive}
      page={page_taken}
      setPage={(p) => dispatch(updateState({ key: "page_taken", value: p }))}
    />
  );
};

type AvailableProps = {
  league_ids: string[];
};
const Available = ({ league_ids }: AvailableProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues } = useSelector((state: RootState) => state.user);
  const {
    column1_available,
    column2_available,
    column3_available,
    column4_available,
    sortAvailableBy,
    activeAvailable,
    page_available,
  } = useSelector((state: RootState) => state.players);

  const headers_sort = [0, 1, 2, 3, 4].map((key, index) => {
    const colnum = key as 0 | 1 | 2 | 3 | 4;

    return {
      text: (
        <SortIcon
          colNum={colnum}
          sortBy={sortAvailableBy}
          setSortBy={(colNum, asc) => {
            dispatch(
              updateState({
                key: "sortAvailableBy",
                value: { column: colNum, asc },
              })
            );
          }}
        />
      ),
      colspan: index === 0 ? 3 : 1,
      classname: sortAvailableBy.column === index ? "active" : "",
    };
  });

  const headers = [
    {
      text: "League",
      colspan: 3,
      classname: sortAvailableBy.column === 0 ? "sort" : "",
    },
    ...[
      { var: column1_available, key: "column1_available" },
      { var: column2_available, key: "column2_available" },
      { var: column3_available, key: "column3_available" },
      { var: column4_available, key: "column4_available" },
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
            options={leaguesColumnOptions}
          />
        ),
        colspan: 1,
        classname: sortAvailableBy.column === index + 1 ? "sort" : "",
      };
    }),
  ];

  const data =
    (leagues &&
      filterLeagueIds(league_ids)
        .sort((a, b) => {
          const a_sortValue = getLeaguesColumnSortValue(
            leagues[a],
            sortAvailableBy,
            [
              column1_available,
              column2_available,
              column3_available,
              column4_available,
            ]
          );
          const b_sortValue = getLeaguesColumnSortValue(
            leagues[b],
            sortAvailableBy,
            [
              column1_available,
              column2_available,
              column3_available,
              column4_available,
            ]
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
                classname: sortAvailableBy.column === 0 ? "sort" : "",
              },
              ...[
                column1_available,
                column2_available,
                column3_available,
                column4_available,
              ].map((col, index) => {
                const { text, trendColor, classname } = getLeaguesColumn(
                  col,
                  leagues[league_id]
                );

                return {
                  text,
                  colspan: 1,
                  style: trendColor,
                  classname:
                    (sortAvailableBy.column === index + 1 ? "sort " : "") +
                    classname,
                };
              }),
            ],
            secondary: leagues && (
              <League league={leagues[league_id]} type={3} />
            ),
          };
        })) ||
    [];

  const setActive = (league_id: string) => {
    dispatch(updateState({ key: "activeAvailable", value: league_id }));
  };

  return (
    <TableMain
      type={2}
      headers_sort={headers_sort}
      headers={headers}
      data={data}
      active={activeAvailable}
      setActive={setActive}
      page={page_available}
      setPage={(p) =>
        dispatch(updateState({ key: "page_available", value: p }))
      }
    />
  );
};

export default PlayerLeagues;
