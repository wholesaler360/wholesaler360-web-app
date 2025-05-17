import { createContext, useState } from "react";
import {
  axiosGet,
  axiosPut,
  axiosPost,
  axiosDelete,
} from "@/constants/api-context";
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
  FetchAllTaxes,
  CreateTax,
  UpdateTax,
  DeleteTax,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";
import { useBranding } from "@/context/BrandingContext";

export const CompanySettingsContext = createContext({});
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const companyDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNo: z.string().min(1, "Mobile number is required"),
  gstin: z
    .string()
    .regex(gstinRegex, "Invalid GSTIN format")
    .optional()
    .or(z.literal(null))
    .or(z.literal("")),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().min(1, "Country is required"),
  termsAndConditions: z.string().optional(),
});

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  ifsc: z.string().min(1, "IFSC code is required"),
  upiId: z.string().optional(),
});

const taxSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  percent: z.number().min(0, "Percent must be a positive number"),
});

export function CompanySettingsController({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateLogo } = useBranding();

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

      return {
        company: companyData.data.value,
        signatures: signatureData.data.value,
        bank: bankData.data.value,
      };
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch company details");
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
      showNotification.error(error.response?.data?.message || "Failed to update company details");
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
      showNotification.error(error.response?.data?.message || "Failed to update bank details");
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
      showNotification.error(error.response?.data?.message || "Failed to update company logo");
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
      showNotification.error(error.response?.data?.message || "Failed to add signature");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSignature = async (name) => {
    try {
      setIsLoading(true);
      const data = { name };
      const response = await axiosDelete(deleteCompanySignature, { data });
      console.log(response);
      if (response.status === 204) {
        showNotification.success("Signature removed successfully");
        return response;
      } else {
        showNotification.error("Failed to remove signature");
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to remove signature");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaxes = async () => {
    try {
      setIsLoading(true);
      const response = await axiosGet(FetchAllTaxes);
      if (response.data.success) {
        return response.data.value.taxes || [];
      } else {
        showNotification.error("Failed to fetch taxes");
        return [];
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch taxes");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addTax = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPost(CreateTax, data);
      if (response.data.success) {
        showNotification.success("Tax added successfully");
        return response.data.value;
      } else {
        showNotification.error("Failed to add tax");
      }
    } catch (error) {
      showNotification.error(
        error.response?.data?.message || "Failed to add tax"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTax = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(UpdateTax, data);
      if (response.data.success) {
        showNotification.success("Tax updated successfully");
        return response.data.value;
      } else {
        showNotification.error("Failed to update tax");
      }
    } catch (error) {
      showNotification.error(
        error.response?.data?.message || "Failed to update tax"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeTax = async (name) => {
    try {
      setIsLoading(true);
      const data = { name };
      const response = await axiosDelete(DeleteTax, { data });
      if (response.status === 204) {
        showNotification.success("Tax removed successfully");
        return true;
      } else {
        showNotification.error("Failed to remove tax");
      }
    } catch (error) {
      showNotification.error(
        error.response?.data?.message || "Failed to remove tax"
      );
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
        taxSchema,
        isLoading,
        fetchCompanyData,
        updateCompany,
        updateBankDetails,
        uploadLogo,
        addSignature,
        removeSignature,
        fetchTaxes,
        addTax,
        updateTax,
        removeTax,
      }}
    >
      {children}
    </CompanySettingsContext.Provider>
  );
}
