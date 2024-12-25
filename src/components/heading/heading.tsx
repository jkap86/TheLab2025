import { RootState } from "@/redux/store";
import Avatar from "../avatar/avatar";
import LeagueTypeSwitch from "../leagueTypeSwitch/leagueTypeSwitch";
import { useSelector } from "react-redux";
import "./heading.css";
import ShNavbar from "../shNavbar/shNavbar";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Heading = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [navTab, setNavTab] = useState("");

  useEffect(() => {
    setNavTab(pathname.split("/")[1].toUpperCase());
  }, []);

  useEffect(() => {
    if (navTab) {
      localStorage.setItem("tab", navTab);
    }
  }, [navTab]);

  return (
    <div className="heading_wrapper">
      <ShNavbar />
      {user && (
        <>
          <div className="heading">
            <Link href={"/"} className="home">
              The Lab Home
            </Link>
            <h1>
              <Avatar id={user.avatar} type="U" text={user.username} />
            </h1>
            <LeagueTypeSwitch />
          </div>
          <h2>
            <select
              value={navTab}
              onChange={(e) =>
                router.push(`/${e.target.value.toLowerCase()}/${user.username}`)
              }
            >
              <option>LEAGUES</option>
              <option>PLAYERS</option>
              <option>LEAGUEMATES</option>
              <option>MATCHUPS</option>
              <option>TRADES</option>
            </select>
          </h2>
        </>
      )}
    </div>
  );
};

export default Heading;
