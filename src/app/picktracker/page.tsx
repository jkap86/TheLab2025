"use client";

import React, { useState } from "react";
import "../../components/homepage/homepage.css";
import Image from "next/image";
import thelablogo from "../../../public/images/thelab.png";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Picktracker = () => {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState("");
  return (
    <div id="homepage">
      <Link href={"/"} className="home">
        The Lab Home
      </Link>
      <div className="logo-container">
        <Image src={thelablogo} alt="logo" className="home-logo" />

        <div className="home-title">
          <h2>Pick Tracker</h2>

          <div className="user-input">
            <input
              type="text"
              value={leagueId}
              placeholder={"League ID"}
              onChange={(e) => setLeagueId(e.target.value)}
              list="users"
            />

            <button
              type="button"
              onClick={() => router.push(`/picktracker/${leagueId.trim()}`)}
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Picktracker;
