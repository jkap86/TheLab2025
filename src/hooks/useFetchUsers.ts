import { updateState } from "@/redux/commonSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

type user = {
  username: string;
  count: string;
};

export const useFetchUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await axios.get("/api/users");

      console.log({
        users: users.data.sort(
          (a: user, b: user) => parseInt(b.count) - parseInt(a.count)
        ),
      });

      dispatch(
        updateState({
          key: "users",
          value: users.data
            .map((user: { username: string }) => user.username)
            .sort((a: string, b: string) => (a > b ? 1 : -1)),
        })
      );
    };

    fetchUsers();
  }, [dispatch]);
};
