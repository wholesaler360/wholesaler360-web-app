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

import { NavItems } from "./navItems/NavItems";
import { NavItems2 } from "./navItems2/NavItems2";
import { NavFooterItems } from "./navFooterItems/NavFooterItems.jsx";
import { UserMenu } from "./userMenu/UserMenu";
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
import UserMenuComponent from "./userMenu/userMenu-index";
import { useEffect } from "react";
import { axiosGet, axiosPost } from "@/context/api-context";

const data = {
  user: {
    name: "Priyanshu",
    mobile: "+91 7096562308",
    avatar: "/avatars/avatar-1.jpg",
  },
  NavItems: [
    {
      title: "Dashboard",
      url: "/",
      icon: Command,
      isActive: true,
    },
    {
      title: "Demo",
      url: "/demo",
      icon: Command,
      isActive: false,
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
  NavItems2: [
    //   {
    //     name: "Project 1",
    //     url: "#",
    //     icon: Command,
    //   },
  ],
  NavFooterItems: [
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
  useEffect(() => {
    const fetchData = async () => {
      const user = await axiosPost("/user-info");
    };
    fetchData();
  }, []);
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
          <NavItems items={data?.NavItems} />
        </ScrollArea>
        <NavItems2 projects={data?.NavItems2} />
        <NavFooterItems items={data?.NavFooterItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserMenuComponent user={data.user} />
      </SidebarFooter>
    </Sidebar>
    // </ScrollArea>
  );
}
