import { ConversationModel } from "../models/conversation.model";
import { MessageModel } from "../models/message.model";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getConversation = asyncHandler(async (currentUserId) => {
  if (!currentUserId) {
    return [];
  }
  const currentUserConversation = await ConversationModel.find({
    $or: [{ sender: currentUserId }, { receiver: currentUserId }],
  })
    .sort({ updatedAt: -1 })
    .populate("messages")
    .populate("sender")
    .populate("receiver");

  const conversation = currentUserConversation.map((conv) => {
    const countUnseenMsg = conv?.messages?.reduce((preve,curr) => {
                const msgByUserId = curr?.msgByUserId?.toString()

                if(msgByUserId !== currentUserId){
                    return  preve + (curr?.seen ? 0 : 1)
                }else{
                    return preve
                }
             
            },0)
            return {
                _id : conv?._id,
                sender : conv?.sender,
                receiver : conv?.receiver,
                unseenMsg : countUnseenMsg,
                lastMsg : conv.messages[conv?.messages?.length - 1]
            }
    });
  }
);
