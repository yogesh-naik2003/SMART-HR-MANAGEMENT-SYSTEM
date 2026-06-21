import { useEffect, useState } from "react";
import api from "@/services/api";

export default function useDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/dashboard")
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard summary", err);
      });
  }, []);

  return data;
}
