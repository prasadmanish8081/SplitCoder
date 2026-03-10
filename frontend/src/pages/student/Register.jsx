import { useEffect, useState } from "react";
import { registerStudent } from "../../services/studentApi";
import { useNavigate } from "react-router-dom";

export default function Register(){

 const[name,setName]=useState("");
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
   await registerStudent({name,email,password});
   navigate("/login");
  }catch{
   setError("Registration failed. Please try again.");
  }finally{
   setLoading(false);
  }
 };

 return(
  <div className="min-h-screen flex items-center justify-center px-4">
   <div className="card p-6 w-full max-w-md">
    <div className="mb-4">
     <h1 className="text-3xl font-bold">Create Account</h1>
     <p className="text-sm text-slate-500 mt-1">Join the Python roadmap.</p>
    </div>

    {error && <div className="card-soft p-3 text-sm text-red-600 mb-3">{error}</div>}

    <input className="input mb-2" placeholder="Name" onChange={e=>setName(e.target.value)} />
    <input className="input mb-2" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
    <input className="input mb-3" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
    <button className="btn btn-primary w-full" onClick={submit} disabled={loading}>
     {loading ? "Creating..." : "Register"}
    </button>
   </div>
  </div>
 );
}
