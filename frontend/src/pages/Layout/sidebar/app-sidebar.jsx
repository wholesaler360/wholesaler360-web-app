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
import { useLocation } from "react-router-dom";

import { NavItems } from "./navItems/NavItems";
import { NavItems2 } from "./navItems2/NavItems2";
import { NavFooterItems } from "./navFooterItems/NavFooterItems.jsx";
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
import UserMenu from "./userMenu/index.jsx";

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
      title: "Customers",
      url: "/customers",
      icon: UsersRound,
      isActive: false,
    },
    {
      title: "Vendors",
      url: "/vendors",
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
          url: "/products",
        },
        {
          title: "Categories",
          url: "/categories",
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
  const location = useLocation();
  const currentPath = location.pathname;

  // Deep clone and update the navigation items with active states
  const navItems = React.useMemo(() => {
    return data.NavItems.map((item) => ({
      ...item,
      isActive:
        item.url === currentPath ||
        item.items?.some((subItem) => subItem.url === currentPath),
      items: item.items?.map((subItem) => ({
        ...subItem,
        isActive: subItem.url === currentPath,
      })),
    }));
  }, [currentPath]);

  return (
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
          <NavItems items={navItems} currentPath={currentPath} />
        </ScrollArea>
        <NavItems2 projects={data?.NavItems2} currentPath={currentPath} />
        <NavFooterItems
          items={data?.NavFooterItems}
          currentPath={currentPath}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
