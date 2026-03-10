import { useEffect, useState } from "react";
import { loginStudent } from "../../services/studentApi";
import { Link, useNavigate } from "react-router-dom";

export default function Login(){

 const[email,setEmail]=useState("");
 const[password,setPassword]=useState("");
 const[loading,setLoading]=useState(false);
 const[error,setError]=useState("");
 const navigate = useNavigate();

 useEffect(()=>{
  const token = localStorage.getItem("studentToken");
  if(token) navigate("/dashboard");
 },[navigate]);

 const submit = async()=>{
  try{
   setLoading(true);
   setError("");
   const res = await loginStudent({email,password});
   localStorage.setItem("studentToken",res.data.token);
   navigate("/dashboard");
  }catch{
   setError("Invalid credentials. Please try again.");
  }finally{
   setLoading(false);
  }
 };

 return(
  <div className="min-h-screen flex items-center justify-center px-4">
   <div className="card p-6 w-full max-w-md">
    <div className="mb-4">
     <h1 className="text-3xl font-bold">Student Login</h1>
     <p className="text-sm text-slate-500 mt-1">Continue your Python journey.</p>
    </div>

    {error && <div className="card-soft p-3 text-sm text-red-600 mb-3">{error}</div>}

    <input className="input mb-2" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
    <input className="input mb-3" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
    <button className="btn btn-primary w-full" onClick={submit} disabled={loading}>
     {loading ? "Signing in..." : "Login"}
    </button>
    <div className="text-sm mt-4 text-center text-slate-600">
     <span>Don't have an account? </span>
     <Link className="underline" to="/register">Sign up</Link>
    </div>
   </div>
  </div>
 );
}
