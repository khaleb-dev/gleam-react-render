import {
  Task,
  Responder,
  User,
  Message,
  TaskStatus,
  AssignedStatus,
} from "../types";

// Mock Users
export const mockUsers: User[] = [
  {
    user_id: "user1",
    first_name: "John",
    last_name: "Smith",
    email: "john@example.com",
    is_verified: true,
    has_set_transaction_pin: false,
    phone_number: "+1234567890",
    role: "user",
    status: "active",
    walletBalance: 250.75,
  },
];

// Mock Responders
export const mockResponders: Responder[] = [
  {
    id: "resp1",
    first_name: "Emma",
    last_name: "Wilson",
    email: "emma@example.com",
    password: "password",
    phone_number: "+1234567891",
    role: "responder",
    is_verified: true,
    last_login: new Date(),
    name: "Emma Wilson",
    rating: 4.8,
    completedTasks: 125,
    profileImage: "https://i.pravatar.cc/150?u=resp1",
    location: {
      country: "US",
      state: "NY",
      city: "New York",
      latitude: "40.7128",
      longitude: "-74.006",
      lat: 40.7128,
      lng: -74.006,
    },
    isActive: true,
    specializations: ["Academic", "Research", "Editing"],
  },
  {
    id: "resp2",
    first_name: "Michael",
    last_name: "Johnson",
    email: "michael@example.com",
    password: "password",
    phone_number: "+1234567892",
    role: "responder",
    is_verified: true,
    last_login: new Date(),
    name: "Michael Johnson",
    rating: 4.5,
    completedTasks: 98,
    profileImage: "https://i.pravatar.cc/150?u=resp2",
    location: {
      country: "US",
      state: "NY",
      city: "New York",
      latitude: "40.7138",
      longitude: "-74.008",
      lat: 40.7138,
      lng: -74.008,
    },
    isActive: true,
    specializations: ["Technical", "Programming", "Data Analysis"],
  },
  {
    id: "resp3",
    first_name: "Sophia",
    last_name: "Lee",
    email: "sophia@example.com",
    password: "password",
    phone_number: "+1234567893",
    role: "responder",
    is_verified: true,
    last_login: new Date(),
    name: "Sophia Lee",
    rating: 4.9,
    completedTasks: 210,
    profileImage: "https://i.pravatar.cc/150?u=resp3",
    location: {
      country: "US",
      state: "NY",
      city: "New York",
      latitude: "40.7148",
      longitude: "-74.005",
      lat: 40.7148,
      lng: -74.005,
    },
    isActive: false,
    specializations: ["Creative Writing", "Content Creation", "Proofreading"],
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    _id: "task1",
    created_by: "user1",
    title: "Research Paper Assistance",
    subject: "Biology",
    description:
      "Need help with research on cellular biology topics for my thesis paper.",
    key_notes: ["Research", "Academic", "Biology", "Urgent"],
    files: [],
    file_urls: ["https://example.com/file1.pdf"],
    status: "completed" as TaskStatus,
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2023-11-17"),
    price: 85,
    responderId: "resp1",
    responder: mockResponders.find((r) => r.id === "resp1"),
    location: { lat: 40.7128, lng: -74.006 },
    date: "2023-11-15",
    time: "10:00",
    category: "Academic",
    images: [],
    userId: "user1",
  },
  {
    _id: "task2",
    created_by: "user1",
    title: "Code Review for Web App",
    subject: "Computer Science",
    description:
      "Need an expert to review my React application code and provide feedback on improvements.",
    key_notes: ["React", "Code Review", "Web Development"],
    files: [],
    file_urls: ["https://example.com/app-code.zip"],
    status: "accepted" as TaskStatus,
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2023-12-02"),
    price: 120,
    responderId: "resp2",
    responder: mockResponders.find((r) => r.id === "resp2"),
    location: { lat: 40.7135, lng: -74.007 },
    date: "2023-12-01",
    time: "14:00",
    category: "Programming",
    images: [],
    userId: "user1",
  },
  {
    _id: "task3",
    created_by: "user1",
    title: "Content Editing for Blog",
    subject: "Writing",
    description:
      "Looking for someone to edit and proofread my tech blog articles.",
    key_notes: ["Editing", "Proofreading", "Blog", "Content"],
    files: [],
    file_urls: ["https://example.com/blog-draft.docx"],
    status: "waiting" as TaskStatus,
    createdAt: new Date("2023-12-10"),
    updatedAt: new Date("2023-12-10"),
    price: 65,
    location: { lat: 40.714, lng: -74.0065 },
    date: "2023-12-10",
    time: "09:00",
    category: "Writing",
    images: [],
    userId: "user1",
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: "msg1",
    taskId: "task1",
    senderId: "user1",
    receiverId: "resp1",
    content:
      "Hi, I was wondering if you could help me understand the feedback on the third section?",
    timestamp: new Date("2023-11-16T14:30:00"),
    isRead: true,
  },
  {
    id: "msg2",
    taskId: "task1",
    senderId: "resp1",
    receiverId: "user1",
    content:
      "Of course! The main issue was with the methodology approach. I suggest adding a control group for comparison.",
    timestamp: new Date("2023-11-16T14:35:00"),
    isRead: true,
  },
  {
    id: "msg3",
    taskId: "task1",
    senderId: "user1",
    receiverId: "resp1",
    content:
      "That makes sense! I'll work on implementing that change. Thanks for the quick response!",
    timestamp: new Date("2023-11-16T14:40:00"),
    isRead: true,
  },
  {
    id: "msg4",
    taskId: "task2",
    senderId: "user1",
    receiverId: "resp2",
    content:
      "Hello, I've uploaded the code for review. Please focus on the authentication component.",
    timestamp: new Date("2023-12-01T10:15:00"),
    isRead: true,
  },
  {
    id: "msg5",
    taskId: "task2",
    senderId: "resp2",
    receiverId: "user1",
    content:
      "I've started reviewing the code. I noticed you might want to refactor the auth hooks for better performance.",
    timestamp: new Date("2023-12-01T16:20:00"),
    isRead: false,
  },
];

// Get messages for specific task
export const getTaskMessages = (taskId: string): Message[] => {
  return mockMessages
    .filter((message) => message.taskId === taskId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

// Get active responders for map
export const getActiveResponders = (): Responder[] => {
  return mockResponders.filter((responder) => responder.isActive);
};

// Get current user (for demo, just return the first user)
export const getCurrentUser = (): User => {
  return mockUsers[0];
};

// Get tasks for current user
export const getUserTasks = (): Task[] => {
  return mockTasks
    .filter((task) => task.created_by === getCurrentUser().user_id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Get task by id
export const getTaskById = (taskId: string): Task | undefined => {
  return mockTasks.find((task) => task._id === taskId);
};

// Get responder by id
export const getResponderById = (
  responderId: string
): Responder | undefined => {
  return mockResponders.find((responder) => responder.id === responderId);
};
