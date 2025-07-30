// Environment configuration
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "https://api.prod.beembyte.com/api/v1";
export const RESPONDER_BASE_URL =
  import.meta.env.VITE_RESPONDER_URL || "http://localhost:3001";
export const API_HOST_ADDRESS =
  import.meta.env.VITE_API_HOST_ADDRESS || "localhost:3000";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_HOST_ADDRESS;

// Paystack configuration
export const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
export const PAYSTACK_SECRET_KEY =
  import.meta.env.VITE_PAYSTACK_SECRET_KEY || "";

export const GOOGLE_CLIENT_ID =
  import.meta.env.GOOGLE_CLIENT_ID ||
  "603696688080-u4n3s4h50d42a0juoq8mum83c5ovog9v.apps.googleusercontent.com";
