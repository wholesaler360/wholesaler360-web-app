import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import ThemeToggle from "./ThemeToggle";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { Link } from "react-router-dom";

function Header() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 ">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/">
                  Wholesaler360
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {breadcrumb.isLast ? (
                      <BreadcrumbPage>{breadcrumb.text}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink as={Link} to={breadcrumb.path}>
                        {breadcrumb.text}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 ml-auto px-4">
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}

export default Header;
