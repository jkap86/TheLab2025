export const getTrendColor_Range = (
  value: number,
  min: number,
  max: number,
  reverse: boolean = false
) => {
  const median = (max - min) / 2 + min;

  if (!reverse && value > median) {
    const x = ((value - median) / (max - median)) * 255;

    return {
      color: `rgb(${255 - x}, ${255}, ${255 - x})`,
    };
  } else if (!reverse && value < median) {
    const x = ((median - value) / (median - min)) * 255;

    return {
      color: `rgb(${255}, ${255 - x}, ${255 - x})`,
    };
  } else if (reverse && value < median) {
    const x = ((median - value) / (median - min)) * 255;

    return {
      color: `rgb(${255 - x}, ${255}, ${255 - x})`,
    };
  } else if (reverse && value > median) {
    const x = ((value - median) / (max - median)) * 255;

    return {
      color: `rgb(${255}, ${255 - x}, ${255 - x})`,
    };
  } else {
    return {
      color: `rgb(255, 255, 255)`,
    };
  }
};

export const getTrendColor_Percentage = (value: number, values: number[]) => {
  const expected_value =
    values.reduce((acc, cur) => acc + cur, 0) / values.length;

  if (value > expected_value) {
    const x = (value / (expected_value * 2)) * 255;

    return { color: `rgb(${255 - x}, ${255}, ${255 - x})` };
  } else if (value < expected_value) {
    const x = (1 - value / expected_value) * 255;

    return {
      color: `rgb(${255}, ${255 - x}, ${255 - x})`,
    };
  } else {
    return {
      color: `rgb(255, 255, 255)`,
    };
  }
};
