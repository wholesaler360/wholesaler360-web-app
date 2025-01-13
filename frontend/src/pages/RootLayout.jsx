import { Suspense, useEffect } from "react";
import Header from "./Layout/header/header";
import { AppSidebar } from "./Layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";

function RootLayout() {
  return (
    <>
      <Helmet>
        <title>WholeSeller360</title>
        <meta
          name="description"
          content="Welcome to WholeSeller180, your one-stop solution for all wholesale
        needs."
        />
        <link rel="icon" type="image/png" href="/dummy-favicon.png" />
      </Helmet>
      <Suspense fallback={<div>Loading...</div>}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header /> {/* This is the header */}
            <Outlet /> {/* This is where the child routes will be rendered */}
          </SidebarInset>
        </SidebarProvider>
      </Suspense>
    </>
  );
}

export default RootLayout;
