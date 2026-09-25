import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarClock, BookOpenCheck, MessageSquareHeart, Settings, GraduationCap } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Task Planner", url: "/planner", icon: CalendarClock },
  { title: "Research Assistant", url: "/research", icon: BookOpenCheck },
  { title: "AI Assistant", url: "/assistant", icon: MessageSquareHeart },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="no-print">
      <SidebarHeader className="px-3 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="surface-primary grid size-10 shrink-0 place-items-center rounded-lg text-primary-foreground shadow-card">
            <GraduationCap className="size-5" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold">TeachAssist</span>
              <span className="block truncate text-xs text-sidebar-foreground/60">Teacher productivity</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-3">
          <p className="rounded-lg border border-sidebar-border bg-sidebar-accent p-3 text-[11px] leading-relaxed text-sidebar-foreground/70">
            AI-generated content may contain inaccuracies. Please review outputs before classroom use.
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
