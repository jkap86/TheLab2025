"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import "./logs.css";

const Logs = () => {
  const [logs, setLogs] = useState<
    {
      id: string;
      ip: string;
      route: string;
      created_at: string;
    }[]
  >([]);
  const [filterRoute, setFilterRoute] = useState("");
  const [filterIp, setFilterIp] = useState("");
  const [filterId, setFilterId] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const logs = await axios.get("/api/fetchlogs");

      setLogs(logs.data);
    };
    fetchLogs();
  }, []);

  const filterLogs = (
    logs: {
      id: string;
      ip: string;
      route: string;
      created_at: string;
    }[]
  ) => {
    return logs.filter((log) => {
      const log_split = log.route.split("/");
      const log_route = log_split[1];
      const log_id = log_split[2];

      return (
        ["", log_id.toLowerCase()].includes(filterId) &&
        ["", log_route].includes(filterRoute) &&
        ["", log.ip].includes(filterIp)
      );
    });
  };

  const { ips, routes, ids } = useMemo(() => {
    const ips: string[] = [];
    const routes: string[] = [];
    const ids: string[] = [];

    filterLogs(logs).forEach((log) => {
      const log_split = log.route.split("/");

      const log_route = log_split[1] || "";
      const log_id = log_split[2] || "";
      const log_ip = log.ip || "";

      console.log(typeof log.ip);

      if (!routes.includes(log_route.toLowerCase())) {
        routes.push(log_route.toLowerCase());
      }

      if (!ids.includes(log_id.toLowerCase())) {
        ids.push(log_id.toLowerCase());
      }

      if (!ips.includes(log_ip.toLowerCase())) {
        ips.push(log_ip.toLowerCase());
      }
    });

    return { ips: ips, routes: routes, ids: ids };
  }, [logs, filterLogs]);

  return (
    <>
      <h1>Logs - Last 24 hrs</h1>
      <div className="filters">
        <select onChange={(e) => setFilterId(e.target.value)} value={filterId}>
          <option key={"All"} value="">
            All
          </option>
          {ids
            .sort((a, b) => {
              const a_sort = parseInt(a) ? 2 : 1;
              const b_sort = parseInt(b) ? 2 : 1;
              return a_sort - b_sort || a > b ? 1 : -1;
            })
            .map((id) => {
              return (
                <option key={id} value={id}>
                  {id}
                </option>
              );
            })}
        </select>

        <select
          onChange={(e) => setFilterRoute(e.target.value)}
          value={filterRoute}
        >
          <option key={"All"} value="">
            All
          </option>
          {routes
            .sort((a, b) => (a > b ? 1 : -1))
            .map((route) => {
              return (
                <option key={route} value={route}>
                  {route}
                </option>
              );
            })}
        </select>

        <select onChange={(e) => setFilterIp(e.target.value)} value={filterIp}>
          <option key={"All"} value="">
            All
          </option>
          {ips
            .sort((a, b) => {
              const a_type = typeof a === "number" ? 2 : 1;
              const b_type = typeof b === "number" ? 2 : 1;

              return a_type - b_type || a > b ? 1 : -1;
            })
            .map((ip, index) => {
              return (
                <option key={index} value={ip}>
                  {ip}
                </option>
              );
            })}
        </select>
      </div>
      <h2>{filterLogs(logs).length} Entries</h2>
      <h2>
        {ids.length} IDs {ips.length} IPs
      </h2>
      <br />
      <table className="logs">
        <thead>
          <tr>
            <th colSpan={2}>timestamp</th>
            <th colSpan={1}>IP</th>
            <th colSpan={2}>route</th>
          </tr>
        </thead>
        <tbody>
          {filterLogs(logs)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((log) => {
              return (
                <tr key={log.id}>
                  <td colSpan={2}>
                    {new Date(log.created_at).toLocaleDateString("en-US") +
                      " " +
                      new Date(log.created_at).toLocaleTimeString("en-US")}
                  </td>
                  <td colSpan={1}>{log.ip}</td>
                  <td colSpan={2}>{log.route}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
};
export default Logs;
