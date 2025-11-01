export default function Header() {
  return (
    <div className="container">
      <div className="row" style={{alignItems:"center", justifyContent:"space-between"}}>
        <h1>LangChain RAG QA : Ask the PDF A question!</h1>
        <span className="badge">React Frontend • Node + Qdrant Backend</span>
      </div>
    </div>
  );
}
