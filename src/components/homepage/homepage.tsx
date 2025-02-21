"use client";

import React, { useEffect, useState } from "react";
import "./homepage.css";
import Image from "next/image";
import thelablogo from "../../../public/images/thelab.png";
import { useRouter } from "next/navigation";
import { useFetchUsers } from "@/hooks/useFetchUsers";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Link from "next/link";

const Homepage = () => {
  const { users } = useSelector((state: RootState) => state.common);
  const router = useRouter();
  const [tab, setTab] = useState("");
  const [username_searched, setUsername_searched] = useState("");
  const [leagueId, setLeagueId] = useState("");

  useFetchUsers();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername_searched(e.target.value);
  };

  useEffect(() => {
    const tab_previous = localStorage.getItem("tab");

    if (tab_previous) {
      setTab(tab_previous);
    } else {
      setTab("LEAGUES");
    }
  }, []);

  return (
    <div id="homepage">
      <Link href={"/picktracker"} className="picktracker">
        PICKTRACKER
      </Link>
      <div className="logo-container">
        <Image src={thelablogo} alt="logo" className="home-logo" />

        <div className="home-title">
          <h1>The Lab</h1>

          <select
            className="nav-options"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
          >
            {["PLAYERS", "LEAGUES", "LEAGUEMATES", "TRADES", "MATCHUPS"].map(
              (option) => {
                return <option key={option}>{option}</option>;
              }
            )}
          </select>

          <div className="user-input">
            <input
              type="text"
              value={username_searched}
              placeholder={"Username"}
              onChange={handleInputChange}
              list="users"
            />
            <datalist id="users">
              {users.map((user) => {
                return (
                  <option key={user} value={user}>
                    {user}
                  </option>
                );
              })}
            </datalist>

            <button
              type="button"
              onClick={() =>
                router.push(`/${tab.toLowerCase()}/${username_searched.trim()}`)
              }
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
