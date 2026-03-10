import { adminLogin } from "../../services/adminApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){

    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[loading,setLoading]=useState(false);
    const[error,setError]=useState("");
    const navigate = useNavigate();

    const submit = async()=>{

        if(!email || !password) return setError("Enter credentials");

        try{
            setLoading(true);
            setError("");
            const res = await adminLogin({email,password});
            localStorage.setItem("adminToken",res.data.token);
            navigate("/admin/dashboard");
        }catch{
            setError("Invalid login");
        }finally{
            setLoading(false);
        }
    };

    return(
        <div className="min-h-screen flex justify-center items-center px-4">
            <div className="card p-6 w-full max-w-md">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold">Admin Login</h1>
                    <p className="text-sm text-slate-500 mt-1">Access the content manager.</p>
                </div>
                {error && <div className="card-soft p-3 text-sm text-red-600 mb-3">{error}</div>}
                <input className="input mb-2" onChange={e=>setEmail(e.target.value)} placeholder="Email" />
                <input className="input mb-3" type="password" onChange={e=>setPassword(e.target.value)} placeholder="Password" />
                <button className="btn btn-primary w-full" onClick={submit} disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </button>
            </div>
        </div>
    )
}
