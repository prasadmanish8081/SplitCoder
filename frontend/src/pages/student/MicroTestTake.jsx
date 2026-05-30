import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMicroTest, submitMicroTest } from "../../services/microtestApi";

export default function MicroTestTake(){
  const { id } = useParams();
  const [test,setTest]=useState(null);
  const [answers,setAnswers]=useState({});
  const [loading,setLoading]=useState(true);
  const [result,setResult]=useState(null);
  const navigate = useNavigate();

  useEffect(()=>{(async()=>{
    try{
      const res = await getMicroTest(id);
      setTest(res.data);
    }catch(err){console.error(err)}finally{setLoading(false)}
  })();},[id]);

  const handleChange=(q,v)=>{
    setAnswers(prev=>({...prev,[q]:v}));
  }

  const submit=async()=>{
    try{
      const res = await submitMicroTest(id, answers);
      setResult(res.data);
    }catch(err){
      console.error(err);
      alert("Submission failed");
    }
  }

  if(loading) return <div>Loading...</div>;
  if(!test) return <div>Not found</div>;

  // assume rubric.answers is an object of question->correctAnswer, but hide answers
  const questions = test.rubric?.questions || Object.keys(test.rubric?.answers || {}).map(k=>({id:k,label:k}));

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{test.title}</h2>
      <div className="card p-4">
        {questions.map(q=> (
          <div key={q.id} className="mb-3">
            <div className="font-medium">{q.label}</div>
            <input className="input mt-1" onChange={e=>handleChange(q.id,e.target.value)} />
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <button className="btn btn-primary" onClick={submit}>Submit</button>
          <button className="btn" onClick={()=>navigate(-1)}>Cancel</button>
        </div>

        {result && (
          <div className="mt-4 card-soft p-3">
            <div>Result: {result.passed ? "Passed" : "Failed"}</div>
            <div>Score: {result.score}</div>
            {result.passed && result.credentialId && (
              <div className="mt-2">
                <a className="underline text-blue-600" href={`/credentials/${result.credentialId}`} >View Credential</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
