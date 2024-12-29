import { PlayerProjection } from "@/lib/types/userTypes";
import { updateState } from "@/redux/commonSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchMatchups } from "@/redux/userActions";
import axios from "axios";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

export const useFetchMatchupsProjections = () => {
  const dispatch: AppDispatch = useDispatch();
  const { state, projections_week } = useSelector(
    (state: RootState) => state.common
  );
  const { leagues, matchups } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!projections_week && state) {
      const fetchProjWeek = async () => {
        const projections_week = await axios.get("/api/projectionsweek", {
          params: {
            week: state.week,
          },
        });

        const proj_obj = Object.fromEntries(
          projections_week.data.map((p: PlayerProjection) => [p.player_id, p])
        );

        dispatch(updateState({ key: "projections_week", value: proj_obj }));
      };

      fetchProjWeek();
    } else if (projections_week && state && leagues && !matchups) {
      dispatch(fetchMatchups());
    }
  }, [state, projections_week, leagues, matchups, dispatch]);
};
