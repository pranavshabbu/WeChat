import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields required"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be atleast 6 characters"});
        }

        const user = await User.findOne({email});

        if(user) return res.status(400).json({message: "Email already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPass
        })

        if(newUser){
            await newUser.save();
            generateToken(newUser._id, res);

            return res.status(201).json({
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                message: "Account created successfully",
            });

            console.log("User created")
        }
        else{
            res.status(400).json({message: "Invalid user data"});
        }
    } catch (error) {
        console.log("Signup error: ",error.message);
        res.status(500). json({message: "Internal server error"});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isPassCorrect = await bcrypt.compare(password, user.password);
        if(!isPassCorrect){
            return res.status(400).json({message: "Invalid credentials"});
        }

        generateToken(user._id, res);

        return res.status(200).json({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            message: "Logged in successfully"
        });

        console.log("Login successful");
    } catch (error) {
        console.log("Login error: ",error.message);
        res.status(500). json({message: "Internal server error"});
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        return res.status(200).json({ message: "Logged out successfully" });
        console.log("Logged out");
    } catch (error) {
        console.log("Logout error: ",error.message);
        res.status(500). json({message: "Internal server error"});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400). json({message: "Profile pic required"});
        }

        const uploadRes = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(userId, {profilePic:uploadRes.secure_url}, {new:true});

        return res.status(200).json(updateUser);
        

        console.log("Profile pic updated");
    } catch (error) {
        console.log("Error updating profile pic");
        res.status(500). json({message: "Internal server error"});
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("checkAuth error: ",error.message);
        res.status(500). json({message: "Internal server error"});
    }
}
