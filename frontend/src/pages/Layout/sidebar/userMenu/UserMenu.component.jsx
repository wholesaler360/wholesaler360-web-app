import {
  BadgeCheck,
  Bell,
  Building,
  ChevronsUpDown,
  Cog,
  CreditCard,
  Key,
  LogOut,
  MonitorCog,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useContext } from "react";
import { UserMenuContext } from "./userMenu.control";
import { Link } from "react-router-dom";
import { getUserData } from "@/lib/authUtils";

function UserMenuComponent() {
  const { logout } = useContext(UserMenuContext);
  const { isMobile } = useSidebar();
  const user = getUserData();

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg">
                  {user?.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.mobileNo}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg">
                    {user?.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.mobileNo}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                permissionModule="account-settings"
                permissionAction="read"
              >
                <Link
                  to="/account-settings"
                  className="flex items-center w-full gap-2"
                >
                  <UserCog />
                  Account Setting
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                permissionModule="company-settings"
                permissionAction="read"
              >
                <Link
                  to="/company-settings"
                  className="flex items-center w-full gap-2"
                >
                  <Building />
                  Company Setting
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                permissionModule="app-settings"
                permissionAction="read"
              >
                <MonitorCog />
                App Setting
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem permissionModule="user" permissionAction="read">
                <UserPlus />
                Users
              </DropdownMenuItem>
              <DropdownMenuItem permissionModule="role" permissionAction="read">
                <Link
                  to="/roles-and-permissions"
                  className="flex items-center w-full gap-2"
                >
                  <ShieldCheck />
                  Roles & Permissions
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-2"
              >
                <LogOut /> Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default UserMenuComponent;
