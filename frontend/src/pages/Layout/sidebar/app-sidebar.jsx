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
import { usePermission } from "@/hooks/usePermission";

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
import { useNavigate } from "react-router-dom";

const data = {
  user: {
    name: "User",
    mobile: "+91 9999999999",
    avatar: "/avatars/avatar-1.jpg",
  },
  NavItems: [
    {
      title: "Dashboard",
      url: "/",
      icon: Command,
      isActive: true,
      permission: "dashboard",
    },
    {
      title: "Customers",
      url: "/customers",
      icon: UsersRound,
      isActive: false,
      permission: "customer",
    },
    {
      title: "Vendors",
      url: "/vendors",
      icon: UserRound,
      isActive: false,
      permission: "vendor",
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
          permission: "product",
        },
        {
          title: "Categories",
          url: "/categories",
          permission: "category",
        },
        {
          title: "Stock",
          url: "/stock",
          permission: "inventory",
        },
      ],
    },
    {
      title: "Sales",
      url: "#",
      icon: ShoppingBag,
      isActive: false,
      items: [

        // {
        //   title: "Quotation",
        //   url: "/quotations",
        //   permission: "quotation",
        // },

        {
          title: "Invoice",
          url: "/invoices",
          permission: "invoice",
        },
        // {
        //   title: "Sales Return",
        //   url: "#",
        //   permission: "sales-return",
        // },
      ],
    },
    {
      title: "Purchases",
      url: "/purchases",
      icon: ShoppingCart,
      isActive: false,
      permission: "purchase",
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
          permission: "sales_report",
        },
        {
          title: "Purchase",
          url: "#",
          permission: "purchase_report",
        },
        {
          title: "Inventory",
          url: "#",
          permission: "inventory_report",
        },
      ],
    },
    {
      title: "Finance & Accounts",
      url: "#",
      icon: Wallet,
      isActive: false,
      items: [
        // {
        //   title: "Expenses",
        //   url: "#",
        //   permission: "expense",
        // },
        {
          title: "Payments",
          url: "/payments",
          permission: "payment",
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
  const { hasReadPermission } = usePermission();

  // Simplified filterNavItems function using the permission property
  const filterNavItems = (items) => {
    return items.filter((item) => {
      if (item.items) {
        const filteredSubItems = item.items.filter((subItem) =>
          hasReadPermission(subItem.permission)
        );

        if (filteredSubItems.length > 0) {
          item.items = filteredSubItems;
          return true;
        }
        return false;
      }

      return !item.permission || hasReadPermission(item.permission);
    });
  };

  // Deep clone and update the navigation items with active states and permissions
  const navItems = React.useMemo(() => {
    const filteredItems = filterNavItems(data.NavItems);
    return filteredItems.map((item) => ({
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

  const navigate = useNavigate();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div onClick={() => navigate("/")} className="cursor-pointer">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {/* {logoUrl && logoUrl !== "/" && (
                    <img
                      src={logoUrl}
                      alt="Company Logo"
                      className="h-8 w-auto object-contain mr-2"
                    />
                  )} */}
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Wholesaler 360</span>
                  <span className="truncate text-xs">
                    {new Date().toDateString()}
                  </span>
                </div>
              </div>
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
