import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateState } from "@/redux/commonSlice";
import "./leagueTypeSwitch.css";

const LeagueTypeSwitch = () => {
  const dispatch: AppDispatch = useDispatch();
  const { type1, type2 } = useSelector((state: RootState) => state.common);

  const setType1 = (type: "Redraft" | "All" | "Dynasty") => {
    return dispatch(updateState({ key: "type1", value: type }));
  };

  const setType2 = (type: "Bestball" | "All" | "Lineup") => {
    return dispatch(updateState({ key: "type2", value: type }));
  };

  return (
    <div className="switch_wrapper">
      <div className="switch">
        <button
          className={"sw " + (type1 === "Redraft" ? "active" : "")}
          onClick={() => dispatch(setType1("Redraft"))}
        >
          Redraft
        </button>
        <button
          className={"sw " + (type1 === "All" ? "active" : "")}
          onClick={() => dispatch(setType1("All"))}
        >
          All
        </button>
        <button
          className={"sw " + (type1 === "Dynasty" ? "active" : "")}
          onClick={() => dispatch(setType1("Dynasty"))}
        >
          Dynasty
        </button>
      </div>
      <div className="switch">
        <button
          className={"sw " + (type2 === "Bestball" ? "active" : "")}
          onClick={() => dispatch(setType2("Bestball"))}
        >
          Bestball
        </button>
        <button
          className={"sw " + (type2 === "All" ? "active" : "")}
          onClick={() => dispatch(setType2("All"))}
        >
          All
        </button>
        <button
          className={"sw " + (type2 === "Lineup" ? "active" : "")}
          onClick={() => dispatch(setType2("Lineup"))}
        >
          Lineup
        </button>
      </div>
    </div>
  );
};

export default LeagueTypeSwitch;
