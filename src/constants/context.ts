import { UserContext } from "@/types";

export const INITIAL_CONTEXT: UserContext = {
  role: 'user',
  device: 'mobile', // Default to mobile as requested
  theme: 'dark',
  mode: 'default'
};
