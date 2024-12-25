import { User, League, Playershare } from "@/lib/types/userTypes";

export const getPlayerShares = (leagues: League[]) => {
  const playershares: {
    [league_id: string]: Playershare;
  } = {};

  const leaguemates: {
    [key: string]: {
      user_id: string;
      username: string;
      avatar: string | null;
      leagues: string[];
    };
  } = {};

  leagues.forEach((league) => {
    league.userRoster.players?.forEach((player_id) => {
      if (!playershares[player_id]) {
        playershares[player_id] = {
          owned: [],
          taken: [],
          available: [],
        };
      }

      playershares[player_id].owned.push(league.league_id);
    });

    league.rosters
      .filter((roster) => roster.roster_id !== league.userRoster.roster_id)
      .forEach((roster) => {
        if (!leaguemates[roster.user_id]) {
          leaguemates[roster.user_id] = {
            user_id: roster.user_id,
            username: roster.username,
            avatar: roster.avatar,
            leagues: [],
          };
        }

        leaguemates[roster.user_id].leagues.push(league.league_id);

        roster.players?.forEach((player_id) => {
          if (!playershares[player_id]) {
            playershares[player_id] = {
              owned: [],
              taken: [],
              available: [],
            };
          }

          playershares[player_id].taken.push({
            lm_roster_id: roster.roster_id,
            lm: {
              user_id: roster.user_id,
              username: roster.username,
              avatar: roster.avatar || "",
            },
            league_id: league.league_id,
          });
        });
      });
  });

  leagues.forEach((league) => {
    const available = Object.keys(playershares).filter(
      (player_id) =>
        !league.rosters.some((roster) => roster.players?.includes(player_id))
    );

    available.forEach((player_id) => {
      playershares[player_id].available.push(league.league_id);
    });
  });

  return { playershares, leaguemates };
};
