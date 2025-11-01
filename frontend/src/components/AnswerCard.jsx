export default function AnswerCard({ question, answer, cached }) {
  if (!answer) return null;
  return (
    <div className="card" style={{marginTop:16}}>
      <div className="row" style={{justifyContent:"space-between"}}>
        <h3>Answer</h3>
        {cached && <span className="badge">cache</span>}
      </div>
      <p><b>Q:</b> {question}</p>
      <p style={{whiteSpace:"pre-wrap"}}>{answer}</p>
    </div>
  );
}
