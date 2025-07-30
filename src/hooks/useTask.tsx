import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { handleApiErrors } from '@/utils/apiResponse';
import { useAppContext } from '@/context/AppContext';
import { taskApi, TaskHistoryQueryParams } from '@/services/taskApi';
import { Task } from '@/types';

export const useTask = () => {
    const [isLoading, setIsLoading] = useState(false);

    const getOneTask = useCallback(async (task_id: string): Promise<Task | undefined> => {
        setIsLoading(true);
        try {
            const response = await taskApi.getTaskById(task_id);
            console.log("useTask: API response:", response);

            if (response.success && response.data) {
                console.log("useTask: Task found successfully");
                return response.data as Task;
            } else {
                console.log("useTask: Task not found or API error");
                if (response.message) {
                    toast.error(response.message);
                }
                handleApiErrors(response);
                return undefined;
            }
        } catch (error) {
            console.error('useTask: Fetch single task failed:', error);
            toast.error('Unable to load task. Please check your connection and try again.');
            return undefined;
        } finally {
            setIsLoading(false);
        }
        return undefined;
    }, []);

    const getTaskHistory = useCallback(async (params?: TaskHistoryQueryParams) => {
        setIsLoading(true);
        try {
            const response = await taskApi.getTaskHistory(params);
            if (response.success && response.data) {
                return {
                    tasks: response.data.items,
                    meta: response.data.meta,
                };
            } else {
                handleApiErrors(response);
                return { tasks: {}, meta: { total: 0, limit: 10, page: 1 } };
            }
        } catch (error) {
            console.error('Fetch task history failed:', error);
            toast.error('An unexpected error occurred. Please try again later.');
            return { tasks: {}, meta: { total: 0, limit: 10, page: 1 } };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getMostRecentTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await taskApi.getMostRecentTasks();
            if (response.success && response.data) {
                return response.data
            } else {
                handleApiErrors(response);
                return
            }
        } catch (error) {
            console.error('Fetch task history failed:', error);
            toast.error('An unexpected error occurred. Please try again later.');
            return
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getDashBoardStats = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await taskApi.getDashboardStats()
            if (response.success && response.data) {
                return response.data
            } else {
                handleApiErrors(response);
                return
            }
        } catch (error) {
            console.error('Fetch task history failed:', error);
            toast.error('An unexpected error occurred. Please try again later.');
            return
        } finally {
            setIsLoading(false);
        }
    }, [])

    const approveTask = useCallback(async (task_id: string): Promise<Task | null> => {

        try {
            const response = await taskApi.approveSubmittedTask(task_id);
            if (response.success && response.data) {
                toast.success(response.message || 'Task approved successfully!');
                return response.data as Task;
            } else {
                handleApiErrors(response);
                return null;
            }
        } catch (error) {
            console.error('Approve task failed:', error);
            toast.error('An unexpected error occurred while approving the task.');
            return null;
        }
    }, []);

    return {
        isLoading,
        getOneTask,
        getTaskHistory,
        getMostRecentTasks,
        getDashBoardStats,
        approveTask
    };
};
