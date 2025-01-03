import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useEffect } from "react";
import { resetState, updateState } from "@/redux/userSlice";
import { League } from "@/lib/types/userTypes";
import { getPlayerShares } from "@/utils/getPlayerShares";
import { getOptimalStarters } from "@/utils/getOptimalStarters";

export const useFetchUserAndLeagues = (searched: string | null) => {
  const dispatch: AppDispatch = useDispatch();
  const { state, ktc_current } = useSelector(
    (state: RootState) => state.common
  );
  const {
    user,
    isLoadingUser,
    errorUser,
    leagues,
    isLoadingLeagues,
    errorLeagues,
  } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (user && user.username.toLowerCase() !== searched?.toLowerCase()) {
      dispatch(resetState());
    } else if (!user && !isLoadingUser && !errorUser) {
      const fetchUser = async () => {
        dispatch(updateState({ key: "isLoadingUser", value: true }));

        try {
          const user_fetched = await axios.get("/api/user", {
            params: { searched },
          });

          dispatch(updateState({ key: "user", value: user_fetched.data }));
        } catch (err: unknown) {
          if (err instanceof Error)
            dispatch(updateState({ key: "errorUser", value: err.message }));
        }

        dispatch(updateState({ key: "isLoadingUser", value: false }));
      };

      fetchUser();
    } else if (
      state &&
      ktc_current &&
      user &&
      !leagues &&
      !isLoadingLeagues &&
      !errorLeagues
    ) {
      const fetchLeagues = async () => {
        dispatch(updateState({ key: "isLoadingLeagues", value: true }));

        try {
          const response = await fetch(
            `/api/leagues?user_id=${user.user_id}&week=${state?.week}&season=${state.season}`
          );

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let text = "";

          if (reader) {
            while (!done) {
              const { value, done: streamDone } = await reader.read();
              done = streamDone;

              if (value) {
                text += decoder.decode(value, { stream: true });

                const matches = text.match(/{"league_id":/g);

                dispatch(
                  updateState({
                    key: "leaguesProgress",
                    value: matches?.length || 0,
                  })
                );
              }
            }
          }

          const text_array = text.split("\n");

          const parsedLeaguesArray: League[] = [];

          text_array
            .filter((chunk) => chunk.length > 0)
            .forEach((chunk) => {
              try {
                parsedLeaguesArray.push(...JSON.parse(chunk));
              } catch (err: unknown) {
                console.log({ err, chunk });
              }
            });

          const leagues_obj = Object.fromEntries(
            parsedLeaguesArray.map((league: League) => {
              return [
                league.league_id,
                {
                  ...league,
                  rosters: league.rosters.map((r) => {
                    return {
                      ...r,
                      starters_optimal: getOptimalStarters(
                        league.roster_positions,
                        r.players || [],
                        ktc_current
                      ),
                    };
                  }),
                  userRoster: {
                    ...league.userRoster,
                    starters_optimal: getOptimalStarters(
                      league.roster_positions,
                      league.userRoster.players || [],
                      ktc_current
                    ),
                  },
                },
              ];
            })
          );

          const { playershares, leaguemates } =
            getPlayerShares(parsedLeaguesArray);

          dispatch(updateState({ key: "leagues", value: leagues_obj }));

          dispatch(updateState({ key: "playershares", value: playershares }));

          dispatch(updateState({ key: "leaguemates", value: leaguemates }));
        } catch (err: unknown) {
          console.log({ err });

          if (err instanceof Error)
            dispatch(updateState({ key: "errorLeagues", value: err.message }));
        }

        dispatch(updateState({ key: "isLoadingLeagues", value: false }));
      };

      fetchLeagues();
    }
  }, [
    searched,
    state,
    ktc_current,
    user,
    isLoadingUser,
    errorUser,
    leagues,
    isLoadingLeagues,
    errorLeagues,
    dispatch,
  ]);
};
