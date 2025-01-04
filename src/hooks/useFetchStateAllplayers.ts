import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useEffect } from "react";
import { updateState } from "@/redux/commonSlice";
import { Allplayer } from "@/lib/types/commonTypes";

export const useFetchStateAndAllplayers = () => {
  const dispatch: AppDispatch = useDispatch();
  const { state, allplayers, ktc_current } = useSelector(
    (state: RootState) => state.common
  );

  useEffect(() => {
    const fetchState = async () => {
      if (!state) {
        const state_new = await axios.get("/api/state");

        dispatch(updateState({ key: "state", value: state_new.data.data }));
      }
    };

    fetchState();
  }, [state, dispatch]);

  useEffect(() => {
    const fetchAllPlayers = async () => {
      if (!allplayers) {
        const allplayers_new = await axios.get("/api/allplayers");

        const allplayers_obj: { [key: string]: Allplayer } = {};

        allplayers_new.data.data.forEach((player_obj: Allplayer) => {
          allplayers_obj[player_obj.player_id] = player_obj;
        });

        dispatch(updateState({ key: "allplayers", value: allplayers_obj }));
      }
    };

    fetchAllPlayers();
  }, [allplayers, dispatch]);

  useEffect(() => {
    const fetchKtcCurrent = async () => {
      if (!ktc_current) {
        const ktc_current_new = await axios.get("/api/ktccurrent");

        const ktc_current_new_obj = Object.fromEntries(
          ktc_current_new.data.values
        );

        dispatch(
          updateState({ key: "ktc_current", value: ktc_current_new_obj })
        );
      }
    };

    fetchKtcCurrent();
  }, [ktc_current, dispatch]);
};
