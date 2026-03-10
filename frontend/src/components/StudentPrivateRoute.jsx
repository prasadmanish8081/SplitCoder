import { Navigate } from "react-router-dom";

export default function StudentPrivateRoute({children}){

    const token = localStorage.getItem("studentToken");

    if(!token) return <Navigate to="/login"/>;

    return children;
}
