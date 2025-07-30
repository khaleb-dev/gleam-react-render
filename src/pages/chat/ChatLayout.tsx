"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaskInfoPanel } from "@/components/chat/TaskInfoPanel";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessagesList } from "@/components/chat/ChatMessagesList";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { useChatPageLogic } from "./useChatPageLogic";

export const ChatLayout = () => {
  const {
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
    isSending,
    deleteMessage,
    isDesktopPanelVisible,
    setDesktopPanelVisible,
  } = useChatPageLogic();

  const isMobile = useIsMobile();

  if (isTaskLoading || isChatLoading) {
    return (
      <div className="h-screen flex bg-white">
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-gray-200 bg-white flex items-center px-4 gap-4">
            <Skeleton className="h-6 w-6" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600">Loading chat...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (taskNotFound || !task) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Task not found</h1>
          <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white top-0 p-0">
      <div className="flex-1 flex flex-col">
        <ChatHeader
          task={task}
          onBack={() => navigate(-1)}
          isDesktopPanelVisible={isDesktopPanelVisible}
          setDesktopPanelVisible={setDesktopPanelVisible}
          isMobile={isMobile}
          taskId={taskId}
          navigate={navigate}
        />
        <div className="flex-1 flex flex-col min-h-0">
          <ChatMessagesList
            messages={messages}
            optimisticMessages={optimisticMessages}
            user={user}
            deleteMessage={deleteMessage}
            task={task}
          />
          <ChatMessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            files={files}
            setFiles={setFiles}
            handleSendMessage={handleSendMessage}
            isSending={isSending}
            task={task}
          />
        </div>
      </div>
      {!isMobile && isDesktopPanelVisible && (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
          <TaskInfoPanel task={task} taskId={taskId} navigate={navigate} />
        </div>
      )}
    </div>
  );
};
