import { updateState } from "@/redux/commonSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useFetchUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await axios.get("/api/users");

      dispatch(updateState({ key: "users", value: users.data }));
    };

    fetchUsers();
  }, []);
};
