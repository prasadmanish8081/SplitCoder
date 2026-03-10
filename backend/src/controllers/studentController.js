import User from "../models/User.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

export const register = async(req, res) =>{
    const {name,email,password} = req.body;

    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({message: "User exists"});

    const user = await User.create({name,email,password});

    res.json(user);
};

export const login = async(req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email, role:"student"});
    if(!user || user.password !== password)
        return res.status(401).json({message:"Invalid"});
    
    const token = jwt.sign({id:user._id, role:"student"}, process.env.JWT_SECRET);
    res.json({token});
}

export const getMe = async (req, res) => {
    try{
        if(!req.userId) return res.status(401).json({ message: "No user" });
        if(!mongoose.isValidObjectId(req.userId)) return res.status(400).json({ message: "Invalid user id" });
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    }catch(err){
        res.status(500).json({ message: "Failed to load profile" });
    }
};

export const updateMe = async (req, res) => {
    try{
        if(!req.userId) return res.status(401).json({ message: "No user" });
        if(!mongoose.isValidObjectId(req.userId)) return res.status(400).json({ message: "Invalid user id" });
        const { name, email, password } = req.body;

        if (email) {
            const exists = await User.findOne({ email, _id: { $ne: req.userId } });
            if (exists) return res.status(400).json({ message: "Email already in use" });
        }

        const update = {};
        if (name !== undefined) update.name = name;
        if (email !== undefined) update.email = email;
        if (password) update.password = password;

        const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    }catch(err){
        res.status(500).json({ message: "Failed to update profile" });
    }
};

export const deleteMe = async (req, res) => {
    try{
        if(!req.userId) return res.status(401).json({ message: "No user" });
        if(!mongoose.isValidObjectId(req.userId)) return res.status(400).json({ message: "Invalid user id" });
        await User.findByIdAndDelete(req.userId);
        res.json({ success: true });
    }catch(err){
        res.status(500).json({ message: "Failed to delete account" });
    }
};
