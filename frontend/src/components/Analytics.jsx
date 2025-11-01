import { useEffect, useState } from "react";
import { getLogs } from "../api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const [rows, setRows] = useState([]);

  useEffect(() => { (async () => setRows((await getLogs()).rows || []))(); }, []);

  const byDay = Object.values((rows||[]).reduce((acc, r)=>{
    const d = (r.timestamp||"").slice(0,10);
    acc[d] = acc[d] || { day: d, count: 0 };
    acc[d].count++;
    return acc;
  }, {})).sort((a,b)=> a.day.localeCompare(b.day));

  return (
    <div className="card" style={{marginTop:16}}>
      <h3>Analytics</h3>
      <p>Total queries: <b>{rows.length}</b></p>
      <div style={{height:260}}>
        <ResponsiveContainer>
          <LineChart data={byDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line dataKey="count" strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
