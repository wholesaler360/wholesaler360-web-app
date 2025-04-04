import { createContext, useState } from "react";
import { axiosGet, axiosPut, axiosPost } from "@/constants/api-context";
import {
  fetchCompanyDetails,
  fetchCompanySignature,
  fetchCompanyBankDetails,
  updateCompanyDetails,
  updateCompanyBankDetails,
  updateCompanyLogo,
  addCompanySignature,
  deleteCompanySignature,
  updateCompanyFavicon,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";
import { useBranding } from "@/context/BrandingContext";
import { COMPANY_DATA_KEY } from "@/constants/globalConstants";

export const CompanySettingsContext = createContext({});

const companyDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(10, "Mobile number must be 10 digits"),
  gstin: z.string().min(15, "GSTIN must be 15 characters"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits"),
  country: z.string().min(1, "Country is required"),
  termsAndConditions: z.string().optional(),
});

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(9, "Account number must be at least 9 digits"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  ifsc: z.string().min(11, "IFSC code must be 11 characters"),
  upiId: z.string().optional(),
});

const handleCompanyUpdate = async (data, companyData) => {
  try {
    const response = await updateCompany(data);
    if (response?.data?.success) {
      // Update local storage with new company data
      localStorage.setItem(
        COMPANY_DATA_KEY,
        JSON.stringify({
          ...companyData,
          ...response.data.value,
        })
      );
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export function CompanySettingsController({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateLogo, updateFavicon } = useBranding();

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      const [companyData, signatureData, bankData] = await Promise.all([
        axiosGet(fetchCompanyDetails),
        axiosGet(fetchCompanySignature),
        axiosGet(fetchCompanyBankDetails),
      ]);

      // Update global branding on initial load
      if (companyData.data.value?.logoUrl) {
        updateLogo(companyData.data.value.logoUrl);
      }
      if (companyData.data.value?.faviconUrl) {
        updateFavicon(companyData.data.value.faviconUrl);
      }

      return {
        company: companyData.data.value,
        signatures: signatureData.data.value,
        bank: bankData.data.value,
      };
    } catch (error) {
      showNotification.error("Failed to fetch company details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompany = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(updateCompanyDetails, data);
      if (response.data.success) {
        showNotification.success("Company details updated successfully");
        return response;
      } else {
        showNotification.error("Failed to update company details");
      }
    } catch (error) {
      showNotification.error("Failed to update company details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBankDetails = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(updateCompanyBankDetails, data);
      if (response.data.success) {
        showNotification.success("Bank details updated successfully");
        return response;
      } else {
        showNotification.error("Failed to update bank details ");
      }
    } catch (error) {
      showNotification.error("Failed to update bank details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadLogo = async (formData) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(updateCompanyLogo, formData);
      if (response.data.success) {
        showNotification.success("Company logo updated successfully");
        // Update global logo
        if (response.data.value?.logoUrl) {
          updateLogo(response.data.value.logoUrl);
        }
        return response;
      } else {
        showNotification.error("Failed to update company logo");
      }
    } catch (error) {
      showNotification.error("Failed to update company logo");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFavicon = async (formData) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(updateCompanyFavicon, formData);
      if (response.data.success) {
        showNotification.success("Favicon updated successfully");
        // Update global favicon
        if (response.data.value?.faviconUrl) {
          updateFavicon(response.data.value.faviconUrl);
        }
        return response;
      } else {
        showNotification.error("Failed to update favicon");
      }
    } catch (error) {
      showNotification.error("Failed to update favicon");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addSignature = async (formData) => {
    try {
      setIsLoading(true);
      const response = await axiosPost(addCompanySignature, formData);
      if (response.data.success) {
        showNotification.success("Signature added successfully");
        return response;
      } else {
        showNotification.error("Failed to add signature");
      }
    } catch (error) {
      showNotification.error("Failed to add signature");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSignature = async (name) => {
    try {
      setIsLoading(true);
      const response = await axiosPost(deleteCompanySignature, { name });
      if (response.data.success) {
        showNotification.success("Signature removed successfully");
        return response;
      } else {
        showNotification.error("Failed to remove signature");
      }
    } catch (error) {
      showNotification.error("Failed to remove signature");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CompanySettingsContext.Provider
      value={{
        companyDetailsSchema,
        bankDetailsSchema,
        isLoading,
        fetchCompanyData,
        updateCompany,
        updateBankDetails,
        uploadLogo,
        uploadFavicon,
        addSignature,
        removeSignature,
      }}
    >
      {children}
    </CompanySettingsContext.Provider>
  );
}
