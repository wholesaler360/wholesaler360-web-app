import { createContext, useState, useCallback } from "react";
import { axiosGet } from "@/constants/api-context";
import { FetchInvoiceById } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";

export const ViewInvoiceContext = createContext({});

function ViewInvoiceController({ children }) {
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoice = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const response = await axiosGet(FetchInvoiceById(id));
      if (response.data.success) {
        setInvoice(response.data.value);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showNotification.error(error.message || "Failed to fetch invoice");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await axiosGet("company-settings/companyDetails/fetch");
      if (response.data.success) {
        setCompany(response.data.value);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showNotification.error(
        error.message || "Failed to fetch company details"
      );
    }
  }, []);

  return (
    <ViewInvoiceContext.Provider
      value={{
        invoice,
        company,
        isLoading,
        fetchInvoice,
        fetchCompanyDetails,
      }}
    >
      {children}
    </ViewInvoiceContext.Provider>
  );
}

export default ViewInvoiceController;
