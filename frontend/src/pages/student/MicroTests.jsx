import { useEffect, useState } from "react";
import { listMicroTests } from "../../services/microtestApi";
import { Link } from "react-router-dom";

export default function MicroTests(){
  const [tests,setTests]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      try{
        const res = await listMicroTests();
        setTests(res.data);
      }catch(err){
        console.error(err);
      }finally{setLoading(false)}
    })();
  },[]);

  if(loading) return <div>Loading micro-tests...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Micro-Tests</h2>
      <div className="grid gap-3">
        {tests.map(t=> (
          <div key={t._id} className="card p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-slate-500">{t.description}</div>
            </div>
            <div>
              <Link to={`/microtests/${t._id}`} className="btn btn-primary">Take</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
