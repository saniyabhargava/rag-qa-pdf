export default function SourceList({ sources=[] }) {
  if (!sources.length) return null;
  return (
    <div className="card" style={{marginTop:16}}>
      <h3>Sources</h3>
      <ul>
        {sources.map((s,i)=> <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}
