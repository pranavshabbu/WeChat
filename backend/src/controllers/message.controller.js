import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
    try {
        //console.log("Getting users for:", req.user._id);
        const currentUser = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: currentUser}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error");
    }
};

export const getMessages = async (req, res) => {
    try {
        const {id} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId:myId, receiverId:id},
                {senderId:id, receiverId:myId}
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
    }
};

export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl = null;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({
            success: true,
            data: newMessage,
            message: "Message sent successfully",
        });
    } catch (error) {
        console.log(error);
    }
};