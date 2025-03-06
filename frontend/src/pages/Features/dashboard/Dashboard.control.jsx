import { createContext, useCallback } from "react";
import { axiosGet } from "@/constants/api-context";
import { FetchDashboard, FetchAlertProductDashboard, FetchBestSellingProductDashboard } from "@/constants/apiEndPoints";

export const DashboardContext = createContext({});

function DashboardController({ children }) {
  const getDashboardData = useCallback(async () => {
    const response = await axiosGet(FetchDashboard);
    return response.data;
  }, []);

  const getAlertProducts = useCallback(async () => {
    const response = await axiosGet(FetchAlertProductDashboard);
    return response.data;
  }, []);

  const getBestSellingProducts = useCallback(async () => {
    const response = await axiosGet(FetchBestSellingProductDashboard);
    return response.data;
  }, []);

  
  return (
    <DashboardContext.Provider value={{ 
      getDashboardData,
      getAlertProducts,
      getBestSellingProducts
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export default DashboardController;
