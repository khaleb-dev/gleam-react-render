import { createContext, useContext, useState } from 'react';
import { Task, TaskStatus, User, MapLocation } from '@/types';
import { mockTasks } from '@/data/mockData';

interface AppContextType {
  user: User;
  tasks: Task[];
  currentLocation: MapLocation;
  setCurrentLocation: (location: MapLocation) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, responderId?: string) => void;
  logoutUser: () => void;
  depositToWallet: (amount: number) => void;
  updateUserProfile: (userData: Partial<User>) => void;
  setUser: (user: User | null) => void;
}

// Default location (New York City)
const defaultLocation: MapLocation = { lat: 40.7128, lng: -74.0060 };

const defaultUser: User = {
  user_id: 'user1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  has_set_transaction_pin: false,
  is_verified: true,
  phone_number: '',
  role: 'user',
  status: 'active',
  walletBalance: 0
};

const defaultContext: AppContextType = {
  user: defaultUser,
  tasks: mockTasks as Task[],
  currentLocation: defaultLocation,
  setCurrentLocation: () => {},
  addTask: () => {},
  updateTaskStatus: () => {},
  logoutUser: () => {},
  depositToWallet: () => {},
  updateUserProfile: () => {},
  setUser: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(defaultContext.tasks);
  const [user, setUser] = useState<User>(defaultContext.user);
  const [currentLocation, setCurrentLocation] = useState<MapLocation>(defaultContext.currentLocation);

  // Add this function to safely update the user state
  const safeSetUser = (newUser: User | null) => {
    if (newUser) {
      setUser(newUser);
    } else {
      // If null is passed, reset to default user instead of setting to null
      setUser(defaultUser);
    }
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus, responderId?: string) => {
    setTasks(
      tasks.map((task) => {
        if (task._id === taskId) {
          return {
            ...task,
            status: newStatus,
            responderId: responderId || task.responderId,
          };
        }
        return task;
      })
    );
  };

  const logoutUser = () => {
    // Clear user data and reset to default
    setUser(defaultUser);
    // In a real app, you would also clear tokens, cookies, etc.
  };

  const depositToWallet = (amount: number) => {
    setUser({
      ...user,
      walletBalance: (user.walletBalance || 0) + amount
    });
  };

  const updateUserProfile = (userData: Partial<User>) => {
    setUser({
      ...user,
      ...userData
    });
  };

  const contextValue: AppContextType = {
    user,
    tasks,
    currentLocation,
    setCurrentLocation,
    addTask,
    updateTaskStatus,
    logoutUser,
    depositToWallet,
    updateUserProfile,
    setUser: safeSetUser,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
