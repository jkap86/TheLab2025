import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const LeaguesProgress = () => {
  const { leaguesProgress } = useSelector((state: RootState) => state.user);
  return <h1>{leaguesProgress} Leagues loaded</h1>;
};

export default LeaguesProgress;
