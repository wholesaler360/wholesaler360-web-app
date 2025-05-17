import { createContext, useState, useCallback } from "react";
import { axiosGet } from "@/constants/api-context";
import {
  FetchInvoiceById,
  fetchCompanySignatures,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";

export const ViewInvoiceContext = createContext({});

function ViewInvoiceController({ children }) {
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signatures, setSignatures] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);

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
      showNotification.error(error.response?.data?.message || "Failed to fetch invoice");
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
        error.response?.data?.message || "Failed to fetch company details"
      );
    }
  }, []);

  const fetchSignatures = useCallback(async () => {
    try {
      const response = await axiosGet(fetchCompanySignatures);
      if (response.data.success) {
        setSignatures(response.data.value);
        // If signatures exist, set the first one as default
        if (response.data.value.length > 0) {
          setSelectedSignature(response.data.value[0]);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showNotification.error(error.message || "Failed to fetch signatures");
    }
  }, []);

  return (
    <ViewInvoiceContext.Provider
      value={{
        invoice,
        company,
        isLoading,
        signatures,
        selectedSignature,
        setSelectedSignature,
        fetchInvoice,
        fetchCompanyDetails,
        fetchSignatures,
      }}
    >
      {children}
    </ViewInvoiceContext.Provider>
  );
}

export default ViewInvoiceController;
