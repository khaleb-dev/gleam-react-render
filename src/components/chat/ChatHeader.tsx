import React from "react";
import { ArrowLeft, Hash, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaskInfoPanel } from "@/components/chat/TaskInfoPanel";
import { Task } from "@/types";
import { NavigateFunction } from "react-router-dom";

type ChatHeaderProps = {
  task: Task;
  onBack: () => void;
  isDesktopPanelVisible: boolean;
  setDesktopPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  taskId: string | undefined;
  navigate: NavigateFunction;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  task,
  onBack,
  isDesktopPanelVisible,
  setDesktopPanelVisible,
  isMobile,
  taskId,
  navigate,
}) => (
  <div className="h-16 border-b border-gray-200 bg-white shadow-sm flex items-center px-4 gap-3 sticky top-0 z-10">
    <Button
      variant="ghost"
      size="icon"
      onClick={onBack}
      className="flex-shrink-0 h-8 w-8 text-gray-600 hover:text-gray-900"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <Hash className="h-5 w-5 text-gray-500" />
    <div className="flex-1">
      <h1 className="font-semibold text-base truncate text-gray-900">{task.title}</h1>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
        <Users className="h-4 w-4" />
      </Button>
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[320px] sm:w-[400px] p-0 flex flex-col">
            <TaskInfoPanel task={task} taskId={taskId} navigate={navigate} />
          </SheetContent>
        </Sheet>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700"
          onClick={() => setDesktopPanelVisible(v => !v)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);
