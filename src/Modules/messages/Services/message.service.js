
import {User,Messege} from "../../../DB/Models/index.js";
export const sendMessageService = async (req,res)=>{
    const {content} = req.body;
    const {receiverId} = req.params;

    const user = await User.findById(receiverId);
    if (!user) {
        return res.status(404).json({message:"User not found"});
    }
    const message = await Messege.create({content,receiverId});
    return res.status(200).json({message:"Message sent successfully",message});
    
}

export const getMessagesService = async (req,res)=>{
    const messages = await Messege.find().populate(
        [
            {
                path:"receiverId",
                select:"firstName lastName"
            }
        ]
    );
    return res.status(200).json({message:"Messages fetched successfully",messages});
}



export const getMyMessagesService = async (req, res) => {
    try {
        const { _id: receiverId } = req.loggedInUser.user;
        const messages = await Messege.find({ receiverId });
        return res.status(200).json({ message: "Your messages fetched successfully", messages });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const makeMessagePublicService = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { _id: userId } = req.loggedInUser.user;

        const message = await Messege.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized: You are not the receiver of this message" });
        }

        message.isPublic = true;
        await message.save();

        return res.status(200).json({ message: "Message made public", message });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const getPublicMessagesService = async (req, res) => {
    try {
        const messages = await Messege.find({ isPublic: true }).populate(
             [
            {
                path:"receiverId",
                select:"firstName lastName" 
            }
        ]
        );
        return res.status(200).json({ message: "Public messages fetched successfully", messages });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};