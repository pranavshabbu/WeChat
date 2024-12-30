import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({isUserLoading: true});
        try {
            //console.log("Trying");
            const res = await axiosInstance.get("/messages/users");
            //console.log("Response received:", res);
            set({users: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isUserLoading: false});
        }
    },

    getMessages: async(userId) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
    
        //console.log("Going to backend sendMessage");
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },    

    subscribeToMessages: () => {
        const {selectedUser} = get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const isRelevantMessage =
            newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
            if (!isRelevantMessage) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({selectedUser}),
}))

