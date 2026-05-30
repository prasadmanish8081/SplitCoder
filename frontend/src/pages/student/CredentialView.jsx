import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyCredential } from "../../services/microtestApi";

export default function CredentialView(){
  const { id } = useParams();
  const [data,setData]=useState(null);

  useEffect(()=>{(async()=>{
    try{
      const res = await verifyCredential(id);
      setData(res.data);
    }catch(err){console.error(err)}
  })();},[id]);

  if(!data) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Credential Verification</h2>
      <div className="card p-4">
        <div><strong>Valid:</strong> {data.valid ? "Yes" : "No"}</div>
        {data.revoked && <div className="text-red-600">This credential has been revoked.</div>}
        {data.payload && (
          <pre className="mt-3 bg-slate-50 p-3 overflow-auto">{JSON.stringify(data.payload, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
