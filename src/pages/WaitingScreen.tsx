import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useAppContext } from '@/context/AppContext';
import { TaskStatusValues } from '@/types';
import { cn } from '@/lib/utils';

interface WaitingScreenProps {
  // You can define props here if needed
}

const WaitingScreen = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, updateTaskStatus } = useAppContext();
  const [isCancelling, setIsCancelling] = useState(false);
  const [taskTitle, setTaskTitle] = useState<string | undefined>('');

  useEffect(() => {
    if (!taskId) {
      toast.error("Task ID is missing.");
      navigate('/');
      return;
    }

    const task = tasks.find(task => task._id === taskId);
    if (!task) {
      toast.error("Task not found.");
      navigate('/');
      return;
    }

    setTaskTitle(task.title);
  }, [taskId, tasks, navigate]);

  const handleCancel = async () => {
    if (!taskId) return;

    try {
      // In a real app, this would call an API to cancel the task
      setIsCancelling(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Update local state
      updateTaskStatus(taskId, TaskStatusValues.CANCELLED);
      toast.success("Task cancelled successfully");
      navigate('/');
    } catch (error) {
      console.error("Failed to cancel task:", error);
      toast.error("Failed to cancel task. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Waiting for Confirmation</h2>
            <p className="text-gray-600">
              We're now waiting for a responder to accept your task:
            </p>
            <p className="mt-2 font-bold">{taskTitle}</p>
          </div>

          <div className="flex justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
          </div>

          <p className="text-center text-gray-500">
            This may take a few minutes. Please be patient.
          </p>

          <Button
            variant="destructive"
            className={cn("w-full", isCancelling && "opacity-50 cursor-not-allowed")}
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel Task"}
          </Button>
        </Card>
      </div>
    </Layout>
  );
};

export default WaitingScreen;
