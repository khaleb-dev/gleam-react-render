import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { taskApi, SendMessageRequest, ChatMessage } from '@/services/taskApi';
import { handleApiErrors } from '@/utils/apiResponse';
import { useAppContext } from '@/context/AppContext';
import { socket } from '@/services/socket';

export const useChat = (taskId: string | undefined) => {
    const { user } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const fetchMessages = useCallback(async () => {
        if (!taskId) return;
        setIsLoading(true);
        try {
            const response = await taskApi.getMessages(taskId);
            if (response.success && response.data) {
                setMessages(response.data);
            } else {
                if (response.message !== "No chat history found for this task") {
                    handleApiErrors(response);
                } else {
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Fetch messages failed:', error);
            toast.error('Could not load chat history.');
        } finally {
            setIsLoading(false);
        }
    }, [taskId]);

    const sendMessage = async (messageData: Omit<SendMessageRequest, 'task_id' | 'sender_type'>) => {
        if (!taskId || !user) return null;
        setIsSending(true);
        try {
            const fullMessageData: SendMessageRequest = { ...messageData, task_id: taskId, sender_type: "users" };
            const response = await taskApi.sendMessage(fullMessageData);

            if (response.success && response.data) {
                // The new message will be added via socket event, so no need to show a toast here
                // toast.success('Message sent!'); 
                return response.data;
            } else {
                handleApiErrors(response);
                return null;
            }
        } catch (error) {
            console.error('Send message failed:', error);
            toast.error('Failed to send message.');
            return null;
        } finally {
            setIsSending(false);
        }
    };

    const deleteMessage = async (messageId: string) => {
        // Optimistically remove the message from the UI
        const originalMessages = messages;
        setMessages(prev => prev.filter(m => m._id !== messageId));

        try {
            const response = await taskApi.deleteMessage(messageId);
            if (response.success) {
                toast.success('Message deleted.');
                // Socket will notify other clients, no extra client-side handling needed here for success
            } else {
                // Revert on failure
                setMessages(originalMessages);
                handleApiErrors(response);
            }
        } catch (error) {
            console.error('Delete message failed:', error);
            // Revert on failure
            setMessages(originalMessages);
            toast.error('Failed to delete message.');
        }
    };

    useEffect(() => {
        if (taskId && socket) {
            socket.emit('join_chat', { task_id: taskId });

            const handleNewMessage = (newMessage: ChatMessage) => {
                if (newMessage.task_id === taskId) {
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                }
            };

            const handleDeleteMessage = (deletedMessage: { messageId: string, taskId: string }) => {
                if (deletedMessage.taskId === taskId) {
                    setMessages(prev => prev.filter(m => m._id !== deletedMessage.messageId));
                }
            };

            socket.on('new_message', handleNewMessage);
            socket.on('message_deleted', handleDeleteMessage);

            return () => {
                socket.emit('leave_chat', { task_id: taskId });
                socket.off('new_message', handleNewMessage);
                socket.off('message_deleted', handleDeleteMessage);
            };
        }
    }, [taskId]);

    return {
        messages,
        isLoading,
        isSending,
        fetchMessages,
        sendMessage,
        deleteMessage,
    };
};
