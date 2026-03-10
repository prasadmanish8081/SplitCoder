import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getMe } from "../services/studentProfileApi";

export default function StudentHeader(){
 const navigate = useNavigate();
 const location = useLocation();
 const[open,setOpen] = useState(false);
 const[navOpen,setNavOpen] = useState(false);
 const[user,setUser] = useState(null);

 useEffect(()=>{
  load();
 },[]);

 useEffect(()=>{
  setOpen(false);
  setNavOpen(false);
 }, [location.pathname, location.search]);

 const load = async()=>{
  try{
   const res = await getMe();
   setUser(res.data);
  }catch{
   setUser(null);
  }
 };

 const initials = (user?.name || user?.email || "U")
  .split(" ")
  .map(s=>s[0])
  .join("")
  .slice(0,2)
  .toUpperCase();

 const closeAll = ()=>{
  setOpen(false);
  setNavOpen(false);
 };

 const toggleNav = ()=>{
  setOpen(false);
  setNavOpen((prev)=>!prev);
 };

 const toggleProfile = ()=>{
  setNavOpen(false);
  setOpen((prev)=>!prev);
 };

   const navItem = (to, label, onClick) => {
    const active = location.pathname === to;
    return (
   <Link
    to={to}
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
     active ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`}
   >
    {label}
   </Link>
  );
 };

 return (
  <div className="w-full border-b border-slate-200 px-4 h-16 flex items-center justify-between relative bg-white/80 backdrop-blur sticky top-0 z-40">
   <div className="flex items-center gap-3">
    <button
     className="md:hidden btn btn-outline text-sm px-3 py-1"
     onClick={toggleNav}
     aria-label="Toggle navigation"
    >
     Menu
    </button>
    <div className="hidden md:flex items-center gap-2">
     {navItem("/dashboard", "Dashboard")}
     {navItem("/problems", "Problems")}
     {navItem("/tutorials", "Tutorials")}
     {navItem("/notebook", "Notebook")}
    </div>
   </div>
   <button
    className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow"
    onClick={toggleProfile}
    aria-label="Profile menu"
   >
    {initials || "U"}
   </button>

   {(navOpen || open) && (
    <button
     className="md:hidden fixed inset-0 top-16 bg-black/20 z-40"
     aria-label="Close menu"
     onClick={closeAll}
    />
   )}

   {navOpen && (
    <div className="absolute left-4 right-4 top-14 bg-white text-black border border-slate-200 shadow-lg md:hidden z-50 rounded-2xl p-3">
     <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Navigation</div>
     <div className="grid grid-cols-2 gap-2">
      <Link to="/dashboard" onClick={closeAll} className="card-soft px-3 py-2 text-sm font-semibold text-center hover:bg-slate-100">Dashboard</Link>
      <Link to="/problems" onClick={closeAll} className="card-soft px-3 py-2 text-sm font-semibold text-center hover:bg-slate-100">Problems</Link>
      <Link to="/tutorials" onClick={closeAll} className="card-soft px-3 py-2 text-sm font-semibold text-center hover:bg-slate-100">Tutorials</Link>
      <Link to="/notebook" onClick={closeAll} className="card-soft px-3 py-2 text-sm font-semibold text-center hover:bg-slate-100">Notebook</Link>
     </div>
    </div>
   )}

   {open && (
    <div className="absolute right-4 top-14 bg-white border border-slate-200 shadow-lg w-52 rounded-2xl overflow-hidden z-50">
     <div className="px-4 py-3 border-b border-slate-100">
      <div className="text-xs uppercase tracking-widest text-slate-500">Account</div>
      <div className="text-sm font-semibold mt-1 truncate">{user?.name || user?.email || "Student"}</div>
     </div>
     <button
      className="block w-full text-left px-4 py-2 hover:bg-slate-100"
      onClick={()=>{
       closeAll();
       navigate("/profile");
      }}
     >
      Profile
     </button>
     <button
      className="block w-full text-left px-4 py-2 hover:bg-slate-100"
      onClick={()=>{
       closeAll();
       navigate("/profile?tab=progress");
      }}
     >
      Progress
     </button>
     <button
      className="block w-full text-left px-4 py-2 hover:bg-slate-100 text-red-600"
      onClick={()=>{
       closeAll();
       localStorage.removeItem("studentToken");
       navigate("/login");
      }}
     >
      Logout
     </button>
    </div>
   )}
  </div>
 );
}
