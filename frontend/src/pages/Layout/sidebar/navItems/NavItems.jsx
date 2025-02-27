import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import React from "react";

export function NavItems({ items, currentPath }) {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = React.useState([]);

  const handleClick = (e, url) => {
    e.preventDefault();
    if (url && url !== "#") {
      navigate(url);
    }
  };

  const isItemActive = (item) => {
    return (
      item.url === currentPath ||
      item.items?.some((subItem) => subItem.url === currentPath)
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items?.length) {
            return (
              <Collapsible
                key={item.title}
                open={openItems.includes(item.title)}
                onOpenChange={(isOpen) => {
                  setOpenItems((prev) =>
                    isOpen
                      ? [...prev, item.title]
                      : prev.filter((i) => i !== item.title)
                  );
                }}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger className="w-full">
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      variant={isItemActive(item) ? "active" : "default"}
                    >
                      <div className="flex w-full items-center">
                        <item.icon
                          className={isItemActive(item) ? "text-primary" : ""}
                        />
                        <span className="flex-1">{item.title}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 
                          ${
                            openItems.includes(item.title) ? 'rotate-180' : ''
                          }`}
                        />                      
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subItem.url === currentPath}
                          >
                            <a
                              href={subItem.url}
                              onClick={(e) => handleClick(e, subItem.url)}
                              className={
                                subItem.url === currentPath
                                  ? "text-primary"
                                  : ""
                              }
                            >
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Render simple item without sub-items
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                variant={isItemActive(item) ? "active" : "default"}
              >
                <a
                  href={item.url}
                  onClick={(e) => handleClick(e, item.url)}
                  className={isItemActive(item) ? "text-primary" : ""}
                >
                  <item.icon
                    className={isItemActive(item) ? "text-primary" : ""}
                  />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
