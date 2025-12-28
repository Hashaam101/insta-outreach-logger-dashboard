import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  MessageSquare, 
  BarChart3,
  Instagram,
  ChevronRight,
  LucideIcon
} from "lucide-react";

export const IconsMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  BarChart3,
  Instagram,
  ChevronRight
};

export type IconName = keyof typeof IconsMap;
