import * as React from "react";
import {
  Box,
  Command,
  FileText,
  LifeBuoy,
  Send,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";

import { NavMain } from "./sidebar-components/nav-main";
import { NavProjects } from "./sidebar-components/nav-projects";
import { NavSecondary } from "./sidebar-components/nav-secondary";
import { NavUser } from "./sidebar-components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const data = {
  user: {
    name: "Priyanshu",
    mobile: "+91 7096562308",
    avatar: "/avatars/avatar-1.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Command,
      isActive: true,
    },
    {
      title: "Customers",
      url: "#",
      icon: UsersRound,
      isActive: false,
    },
    {
      title: "Vendors",
      url: "#",
      icon: UserRound,
      isActive: false,
    },
    {
      title: "Inventory",
      url: "#",
      icon: Box,
      isActive: false,
      items: [
        {
          title: "Products",
          url: "#",
        },
        {
          title: "Categories",
          url: "#",
        },
        {
          title: "Stock",
          url: "#",
        },
      ],
    },
    {
      title: "Sales",
      url: "#",
      icon: ShoppingBag,
      isActive: false,
      items: [
        {
          title: "Quotation",
          url: "#",
        },
        {
          title: "Invoice",
          url: "#",
        },
        {
          title: "Sales Return",
          url: "#",
        },
      ],
    },

    {
      title: "Purchase",
      url: "#",
      icon: ShoppingCart,
      isActive: false,
      items: [
        {
          title: "Purchase Invoice",
          url: "#",
        },
        {
          title: "Purchase Return",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: FileText,
      isActive: false,
      items: [
        {
          title: "Sales",
          url: "#",
        },
        {
          title: "Purchase",
          url: "#",
        },
        {
          title: "Inventory",
          url: "#",
        },
      ],
    },
    {
      title: "Finance & Accounts",
      url: "#",
      icon: Wallet,
      isActive: false,
      items: [
        {
          title: "Expenses",
          url: "#",
        },
        {
          title: "Payments",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    // <ScrollArea>
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Wholesaler 360</span>
                  <span className="truncate text-xs">
                    {new Date().toDateString()}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea>
          <NavMain items={data.navMain} />
        </ScrollArea>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
    // </ScrollArea>
  );
}
