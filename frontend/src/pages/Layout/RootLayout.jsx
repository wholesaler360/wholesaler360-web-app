import { Suspense, useEffect } from "react";
import Header from "./header/header";
import { AppSidebar } from "./sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useBranding } from "@/context/BrandingContext";

function RootLayout() {
  const { faviconUrl } = useBranding();

  return (
    <>
      <Helmet>
        <title>Wholesaler360</title>
        <meta
          name="description"
          content="Welcome to WholeSaler360, your one-stop solution for all wholesale
        needs."
        />
        <link rel="icon" type="image/png" href={faviconUrl} />
      </Helmet>
      <Suspense fallback={<div>Loading...</div>}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <Outlet /> {/* This is where the child routes will be rendered */}
          </SidebarInset>
        </SidebarProvider>
      </Suspense>
    </>
  );
}

export default RootLayout;
