import { useState, useEffect } from 'react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, TaskStatus, TaskStatusValues } from '@/types';
import { useTask } from '@/hooks/useTask';
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const TaskHistory = () => {
  const { user } = useAppContext();
  const { getTaskHistory, isLoading } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [tasksByMonth, setTasksByMonth] = useState<Record<string, Task[]>>({});
  const [meta, setMeta] = useState({ total: 0, limit: 10, page: 1 });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch tasks from API
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const fetchTasks = async () => {
        try {
          const params: {
            title?: string;
            status?: string;
            limit?: number;
            page?: number;
          } = {
            limit: 10,
            page: currentPage
          };

          if (searchQuery.trim()) {
            params.title = searchQuery.trim();
          }

          if (statusFilter !== 'all') {
            params.status = statusFilter;
          }

          const result = await getTaskHistory(params);

          if (result) {
            setTasksByMonth(result.tasks);
            setMeta(result.meta);
          }
        } catch (error) {
          console.error("Error fetching task history:", error);
          toast.error("An unexpected error occurred while fetching tasks");
        }
      };

      fetchTasks();
    }, 500); // Debounce duration

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, statusFilter, currentPage, getTaskHistory]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="task-history-page max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-bold mb-6">Task History</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <Input
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={TaskStatusValues.PENDING}>Pending</SelectItem>
              <SelectItem value={TaskStatusValues.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={TaskStatusValues.COMPLETED}>Completed</SelectItem>
              <SelectItem value={TaskStatusValues.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-52 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(tasksByMonth).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(tasksByMonth).map(([month, tasks]) => (
            <div key={month} className="space-y-4">
              <h2 className="font-semibold text-gray-800 border-b pb-2">{month}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={{
                      ...task,
                      createdAt: new Date(task.createdAt),
                      updatedAt: new Date(task.updatedAt),
                      deadline: task.deadline ? new Date(task.deadline) : undefined,
                      key_notes: task.key_notes || task.key_notes || [],
                      files: task.files || task.files || [],
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta.total > meta.limit && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.ceil(meta.total / meta.limit) }, (_, i) => i + 1)
                  .slice(0, 5) // Limit visible pages
                  .map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                {Math.ceil(meta.total / meta.limit) > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(Math.ceil(meta.total / meta.limit), currentPage + 1))}
                    className={currentPage === Math.ceil(meta.total / meta.limit) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-600">No tasks found</h3>
          <p className="text-gray-500 mt-2">
            {meta.total === 0
              ? "You haven't created any tasks yet."
              : "No tasks match your current filter."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
