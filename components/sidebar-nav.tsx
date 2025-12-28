"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IconsMap, IconName } from "./icons-map";

export interface NavItem {
  name: string;
  href: string;
  icon: IconName;
}

interface SidebarNavProps {
  items: NavItem[];
  isCollapsed: boolean;
}

const NavLink = ({ 
  item, 
  isActive, 
  isCollapsed 
}: { 
  item: NavItem; 
  isActive: boolean; 
  isCollapsed: boolean;
}) => {
  const IconComponent = IconsMap[item.icon];
  
  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 group relative overflow-hidden",
        isActive 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
            : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
        isCollapsed && "justify-center px-0"
      )}
    >
      <div className={cn("flex items-center gap-3 z-10", isCollapsed && "gap-0")}>
        {IconComponent && (
          <IconComponent className={cn(
              "h-4 w-4 transition-transform duration-200 shrink-0",
              isActive ? "scale-110" : "group-hover:scale-110"
          )} />
        )}
        {!isCollapsed && <span className="tracking-tight truncate">{item.name}</span>}
      </div>
      {!isCollapsed && isActive && <ChevronRight className="h-3 w-3 opacity-50 z-10" />}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-bold text-xs">
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export function SidebarNav({ items, isCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink 
          key={item.href} 
          item={item} 
          isActive={pathname === item.href} 
          isCollapsed={isCollapsed} 
        />
      ))}
    </nav>
  );
}