"use client";

import React, { useEffect, useState } from "react";
import "./homepage.css";
import Image from "next/image";
import thelablogo from "../../../public/images/thelab.png";
import { useRouter } from "next/navigation";

const Homepage = () => {
  const router = useRouter();
  const [tab, setTab] = useState("");
  const [username_searched, setUsername_searched] = useState("");
  const [leagueId, setLeagueId] = useState("");

  const leagueTabs = ["PICKTRACKER", "PLAYOFFS"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (leagueTabs.includes(tab)) {
      setLeagueId(e.target.value);
    } else {
      setUsername_searched(e.target.value);
    }
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
      <div className="logo-container">
        <Image src={thelablogo} alt="logo" className="home-logo" />

        <div className="home-title">
          <h1>The Lab</h1>

          <select
            className="nav-options"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
          >
            {[
              "PLAYERS",
              "LEAGUES",
              "LEAGUEMATES",
              "TRADES",
              "MATCHUPS",
              ...leagueTabs,
            ].map((option) => {
              return <option key={option}>{option}</option>;
            })}
          </select>

          <div className="user-input">
            <input
              type="text"
              value={leagueTabs.includes(tab) ? leagueId : username_searched}
              placeholder={leagueTabs.includes(tab) ? "League ID" : "Username"}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/${tab.toLowerCase()}/${
                    leagueTabs.includes(tab)
                      ? leagueId.trim()
                      : username_searched.trim()
                  }`
                )
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
