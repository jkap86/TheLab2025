import TableMain from "@/components/tableMain/tableMain";
import { starterColumnOptions } from "../helpers/getStartersColumn";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { updateMatchupsState } from "../redux/matchupsSlice";
import { filterLeagueIds } from "@/utils/filterLeagues";

const StarterLeagues = ({
  player_obj,
}: {
  player_id: string;
  player_obj: {
    user: { start: string[]; bench: string[] };
    opp: { start: string[]; bench: string[] };
  };
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { leagues } = useSelector((state: RootState) => state.user);
  const { starterDetailTab1, starterDetailTab2 } = useSelector(
    (state: RootState) => state.matchups
  );

  const getLeaguesList = (tab: string) => {
    switch (tab) {
      case "Start":
        return filterLeagueIds(player_obj.user.start);
      case "Opp Start":
        return filterLeagueIds(player_obj.opp.start);
      case "Start P":
        return filterLeagueIds(player_obj.user.start, true);
      case "Opp Start P":
        return filterLeagueIds(player_obj.opp.start, true);
      case "Bench P":
        return filterLeagueIds(player_obj.user.bench, true);
      case "Opp Bench P":
        return filterLeagueIds(player_obj.opp.bench, true);
      default:
        return [];
    }
  };

  const data1 = getLeaguesList(starterDetailTab1)
    .sort((a, b) => (leagues && leagues[a].index - leagues[b].index) || 0)
    .map((league_id) => {
      return {
        id: league_id,
        columns: [
          {
            text: leagues?.[league_id].name || league_id,
            colspan: 1,
            classname: "",
          },
        ],
      };
    });

  const data2 = getLeaguesList(starterDetailTab2)
    .sort((a, b) => (leagues && leagues[a].index - leagues[b].index) || 0)
    .map((league_id) => {
      return {
        id: league_id,
        columns: [
          {
            text: leagues?.[league_id].name || league_id,
            colspan: 1,
            classname: "",
          },
        ],
      };
    });

  return (
    <>
      <div className="nav">
        <select
          value={starterDetailTab1}
          onChange={(e) =>
            dispatch(
              updateMatchupsState({
                key: "starterDetailTab1",
                value: e.target.value,
              })
            )
          }
        >
          {starterColumnOptions.map((o) => {
            return <option key={o.abbrev}>{o.abbrev}</option>;
          })}
        </select>
        <select
          value={starterDetailTab2}
          onChange={(e) =>
            dispatch(
              updateMatchupsState({
                key: "starterDetailTab2",
                value: e.target.value,
              })
            )
          }
        >
          {starterColumnOptions.map((o) => {
            return <option key={o.abbrev}>{o.abbrev}</option>;
          })}
        </select>
      </div>
      <TableMain type={2} half={true} headers={[]} data={data1} />
      <TableMain type={2} half={true} headers={[]} data={data2} />
    </>
  );
};

export default StarterLeagues;
