import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/tasks/TaskCard';
import { cn } from '@/lib/utils';
import { Task, TaskStatus, User } from '@/types';
import { ClipboardList, CheckCircle, Clock, Wallet } from "lucide-react"
import { useTask } from '@/hooks/useTask';
import { useAuth } from '@/hooks/useAuth';
import { userApiService } from '@/services/userApi';

// Add the missing formatTimeRemaining function
const formatTimeRemaining = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  // If past due
  if (diff < 0) {
    return 'Past due';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  }
};

const Index = () => {

  const { getMostRecentTasks, getDashBoardStats } = useTask()

  const navigate = useNavigate();
  const { isLoading: userIsLoading, loggedInUser } = useAuth();

  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>(null);
  const [dashStats, setDashStats] = useState(null)

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserProfile = async () => {
      try {
        const response = await userApiService.getUserProfile();
        
        if (response.success && isMounted) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardStats = async () => {
      try {
        const dashboardStats = await getDashBoardStats();
        if (isMounted) {
          setDashStats(dashboardStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    
    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, [getDashBoardStats]);

  useEffect(() => {
    let isMounted = true;
    
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        // Fetching the most recent 10 tasks instead of all tasks
        const tasks = await getMostRecentTasks();

        if (!tasks || !isMounted) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Mapping the tasks to the required structure
        const mappedTasks = tasks.map(task => ({
          ...task,
          _id: task._id,
          title: task.title,
          description: task.description,
          price: task.price,
          status: task.status as TaskStatus,
          location: task.location || { lat: 0, lng: 0 },
          date: task.date || '',
          time: task.time || '',
          category: task.category || '',
          images: task.images || [],
          userId: task.userId || '',
          subject: task.subject,
          deadline: task.deadline,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          key_notes: task.key_notes || []
        }));

        if (isMounted) {
          // Updating the relevant states
          setRecentTasks(mappedTasks.slice(0, 3)); // Top 3 recent tasks
          setActiveTasks(mappedTasks.filter(t => t.status === 'in_progress'));
          setCompletedTasks(mappedTasks.filter(t => t.status === 'completed'));
          setPendingTasks(mappedTasks.filter(t => t.status === 'pending'));
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [getMostRecentTasks]);

  // Convert dashboard task to full Task for TaskCard component
  const convertDashboardToFullTask = (task: Task): Task => {
    return {
      ...task,
      _id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      location: task.location || { lat: 0, lng: 0 },
      date: task.date || '',
      time: task.time || '',
      category: task.category || '',
      images: task.images || [],
      userId: task.userId || '',
      price: task.price,
      createdAt: task.createdAt || new Date(),
      updatedAt: task.updatedAt || new Date()
    };
  };

  console.log('stats', dashStats)

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user?.first_name}!</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Here's an overview of your dashboard
        </p>
      </header>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            title: "Active Tasks",
            value: dashStats ? dashStats.active : 0,
            icon: <ClipboardList className="h-4 w-4" />,
            color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          },
          {
            title: "Completed Tasks",
            value: dashStats ? dashStats.completed : 0,
            icon: <CheckCircle className="h-4 w-4" />,
            color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
          },
          {
            title: "Pending Tasks",
            value: dashStats ? dashStats.pending : 0,
            icon: <Clock className="h-4 w-4" />,
            color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
          },
          {
            title: "Wallet Balance",
            value: `₦${user?.wallet_id?.balance?.toLocaleString() || '0'}`,
            icon: <Wallet className="h-4 w-4" />,
            color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-beembyte-darkBlue rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {stat?.title}
                </h3>
                <div className="text-lg font-bold mt-2">
                  {stat?.value}
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat?.color}`}>
                <div className="text-lg">{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Tasks Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tasks</h2>
          <Button
            onClick={() => navigate('/create-task')}
            className="bg-primary hover:bg-beembyte-lightBlue text-sm"
          >
            Create New Task
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beembyte-blue"></div>
          </div>
        ) : recentTasks?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTasks?.map(task => (
              <div key={task._id} onClick={() => navigate(`/task/${task._id}`)} className="cursor-pointer">
                <TaskCard task={convertDashboardToFullTask(task)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-beembyte-darkBlue rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              You haven't created any tasks. Start by creating a new task.
            </p>
            <Button
              onClick={() => navigate('/create-task')}
              className="bg-beembyte-blue hover:bg-beembyte-lightBlue text-sm"
            >
              Create Your First Task
            </Button>
          </div>
        )}
      </section>

      {/* Upcoming deadlines */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Upcoming Deadlines</h2>

        {activeTasks.filter(task => task.deadline).length > 0 ? (
          <div className="bg-white dark:bg-beembyte-darkBlue rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                  <tr>
                    <th className="py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400">Task Title</th>
                    <th className="py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400">Deadline</th>
                    <th className="py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activeTasks
                    .filter(task => task.deadline)
                    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                    .slice(0, 5)
                    .map(task => (
                      <tr
                        key={task._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => navigate(`/task/${task._id}`)}
                      >
                        <td className="py-4 px-6 text-xs font-medium">{task.title}</td>
                        <td className="py-4 px-6 text-xs">
                          {new Date(task.deadline!).toLocaleDateString()}
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            ({formatTimeRemaining(new Date(task.deadline!))})
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={cn(`px-3 py-1 rounded-full text-xs font-medium`, {
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': task.status === 'in_progress',
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': task.status === 'pending'
                          })}>
                            {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-beembyte-darkBlue rounded-xl shadow p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No upcoming deadlines at the moment.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
