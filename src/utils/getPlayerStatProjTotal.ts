export const getPlayerTotal = (
  scoring_settings: { [key: string]: number },
  stat_obj: { [key: string]: number }
) => {
  const projection = Object.keys(stat_obj)
    .filter((key) => Object.keys(scoring_settings).includes(key))
    .reduce((acc, cur) => acc + scoring_settings[cur] * stat_obj[cur], 0);

  return projection;
};
