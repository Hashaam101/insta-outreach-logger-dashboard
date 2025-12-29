import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  MessageSquare, 
  BarChart3,
  Instagram,
  ChevronRight,
  LucideIcon,
  Target,
  User,
  Globe,
  Shield
} from "lucide-react";

export const IconsMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  BarChart3,
  Instagram,
  ChevronRight,
  Target,
  User,
  Globe,
  Shield
};

export type IconName = keyof typeof IconsMap;
