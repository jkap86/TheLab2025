import { updateState } from "@/redux/commonSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useFetchUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await axios.get("/api/users");

      console.log({ users: users.data.length });
      dispatch(updateState({ key: "users", value: users.data }));
    };

    fetchUsers();
  }, [dispatch]);
};
