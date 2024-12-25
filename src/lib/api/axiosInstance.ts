import axios from "axios";
import axiosRetry from "axios-retry";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
});

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay(retryCount, error) {
    if (error) {
      console.log(`ERROR RETRYING - ${retryCount}`, { error: error.message });
    }
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 1000;
  },
  retryCondition(error) {
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

export default axiosInstance;
