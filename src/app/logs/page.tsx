"use client";

import axios from "axios";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    const fetchLogs = async () => {
      const logs = await axios.get("/api/fetchlogs");

      setLogs(logs.data);
    };
    fetchLogs();
  }, []);

  return (
    <>
      <h1>Logs - Last 24 hrs</h1>
      <h2>{logs.length} Entries</h2>
      <br />
      <table className="logs">
        <thead>
          <tr>
            <th>timestamp</th>
            <th>IP</th>
            <th>route</th>
          </tr>
        </thead>
        <tbody>
          {logs
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((log) => {
              return (
                <tr key={log.id}>
                  <td>
                    {new Date(log.created_at).toLocaleDateString("en-US") +
                      " " +
                      new Date(log.created_at).toLocaleTimeString("en-US")}
                  </td>
                  <td>{log.ip}</td>
                  <td>{log.route}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
};
export default Logs;
