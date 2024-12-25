import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import LoadingIcon from "../loadingIcon/loadingIcon";
import Heading from "../heading/heading";
import LeaguesProgress from "../leaguesProgress/leaguesProgress";
import { useFetchStateAndAllplayers } from "@/hooks/useFetchStateAllplayers";
import { useFetchUserAndLeagues } from "@/hooks/useFetchUserLeagues";

interface LoadCommonDataProps {
  searched: string;
  component: JSX.Element;
}

const LoadCommonData = ({ searched, component }: LoadCommonDataProps) => {
  const {
    errorUser,
    user,
    isLoadingUser,
    leagues,
    isLoadingLeagues,
    errorLeagues,
  } = useSelector((state: RootState) => state.user);

  useFetchStateAndAllplayers();
  useFetchUserAndLeagues(searched);

  return (
    (errorUser && errorUser) || (
      <>
        {!user && !isLoadingUser && !errorUser ? (
          ""
        ) : isLoadingUser ? (
          <LoadingIcon message={"Loading User"} />
        ) : (
          errorUser || <Heading />
        )}
        {!leagues && !isLoadingLeagues && !errorLeagues ? (
          ""
        ) : isLoadingLeagues ? (
          <>
            <LeaguesProgress />
            <LoadingIcon message={"Loading Leagues"} />
          </>
        ) : (
          errorLeagues || component
        )}
      </>
    )
  );
};

export default LoadCommonData;
