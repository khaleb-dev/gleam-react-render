import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useTask } from "@/hooks/useTask";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Task } from "@/types";

export const useChatPageLogic = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const { getOneTask, isLoading: isTaskLoading } = useTask();
  const {
    messages,
    fetchMessages,
    sendMessage,
    deleteMessage,
    isLoading: isChatLoading,
    isSending,
  } = useChat(taskId);
  const { uploadFiles, isUploading } = useFileUpload();

  const [task, setTask] = useState<Task | null>(null);
  const [taskNotFound, setTaskNotFound] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDesktopPanelVisible, setDesktopPanelVisible] = useState(true);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      try {
        const fetchedTask = await getOneTask(taskId);
        if (fetchedTask) {
          setTask(fetchedTask);
          setTaskNotFound(false);
        } else {
          setTask(null);
          setTaskNotFound(true);
        }
      } catch (error) {
        setTask(null);
        setTaskNotFound(true);
      }
    };
    fetchTask();
  }, [taskId, getOneTask]);

  useEffect(() => {
    if (taskId) {
      fetchMessages();
    }
  }, [taskId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, optimisticMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [newMessage]);

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getLocalPreviewURLs = () => files.map(file => URL.createObjectURL(file));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && files.length === 0) || !task || !user) return;

    // Create optimistic message for immediate UI feedback
    let fakeFileUrls: string[] = [];
    if (files.length > 0) {
      fakeFileUrls = getLocalPreviewURLs();
    }
    const tmpId = "opt-" + Date.now();
    const nowISOString = new Date().toISOString();

    setOptimisticMessages(prev => [
      ...prev,
      {
        _id: tmpId,
        task_id: taskId,
        sender_id: {
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: "user"
        },
        sender_type: "users",
        message: newMessage.trim(),
        file_urls: fakeFileUrls,
        createdAt: nowISOString,
        updatedAt: nowISOString,
        optimistic: true
      }
    ]);

    const messageText = newMessage.trim();
    const messagesToUpload = [...files];
    
    // Clear form immediately to prevent re-submission
    setNewMessage("");
    setFiles([]);

    try {
      // Upload files first if any
      let uploadedFileUrls: string[] = [];
      if (messagesToUpload.length > 0) {
        const urls = await uploadFiles(messagesToUpload);
        if (urls) {
          uploadedFileUrls = urls;
        } else {
          // Upload failed, remove optimistic message and restore form
          setOptimisticMessages(prev => prev.filter(msg => msg._id !== tmpId));
          setNewMessage(messageText);
          setFiles(messagesToUpload);
          return;
        }
      }

      // Send message with uploaded file URLs
      const response = await sendMessage({
        message: messageText,
        file_urls: uploadedFileUrls,
      });

      if (!response || !response._id) {
        // Message send failed, remove optimistic message and restore form
        setOptimisticMessages(prev => prev.filter(msg => msg._id !== tmpId));
        setNewMessage(messageText);
        setFiles(messagesToUpload);
      }
    } catch (error) {
      // Error occurred, remove optimistic message and restore form
      setOptimisticMessages(prev => prev.filter(msg => msg._id !== tmpId));
      setNewMessage(messageText);
      setFiles(messagesToUpload);
    }
  };

  useEffect(() => {
    if (optimisticMessages.length === 0 || messages.length === 0) return;
    setOptimisticMessages(prevOpts =>
      prevOpts.filter(optMsg => {
        const existsInServer = messages.some(serverMsg =>
          serverMsg.message === optMsg.message &&
          serverMsg.sender_type === "users" &&
          Math.abs(new Date(serverMsg.createdAt).getTime() - new Date(optMsg.createdAt).getTime()) < 60000
        );
        return !existsInServer;
      })
    );
  }, [messages]);

  return {
    taskId,
    navigate,
    user,
    task,
    taskNotFound,
    isTaskLoading,
    isChatLoading,
    messages,
    optimisticMessages,
    newMessage,
    setNewMessage,
    files,
    setFiles,
    handleSendMessage,
    isSending: isSending || isUploading,
    deleteMessage,
    messagesEndRef,
    textareaRef,
    isDesktopPanelVisible,
    setDesktopPanelVisible,
    handleFileChange,
    handleRemoveFile,
    handleEmojiSelect,
  };
};
