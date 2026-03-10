import jwt from "jsonwebtoken";

export const studentAuth = (req,res,next)=>{
 const token = req.headers.authorization?.split(" ")[1];

 if(!token) return res.status(401).json({message:"No token"});

 try{
  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  if(decoded.role !== "student") throw Error();
  req.userId = decoded.id;
  next();
 }catch{
  res.status(403).json({message:"Unauthorized"});
 }
};
