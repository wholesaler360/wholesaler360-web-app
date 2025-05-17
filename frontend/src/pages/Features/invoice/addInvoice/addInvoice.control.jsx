import { createContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosGet, axiosPost } from "@/constants/api-context";
import {
  CreateInvoice,
  FetchCustomerList,
  FetchProductListDropdownInvoice,
  fetchCompanyBankDetails,
  fetchCompanySignatures,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AddInvoiceContext = createContext({});

const invoiceSchema = z.object({
  invoiceDate: z.date({
    required_error: "Invoice date is required",
  }),
  invoiceDueDate: z.date({
    required_error: "Invoice due date is required",
  }),
  customerId: z.string().min(1, "Customer is required"),
  products: z
    .array(
      z.object({
        id: z.string().min(1, "Product is required"),
        quantity: z.preprocess(
          (val) => Number(val),
          z.number().min(1, "Quantity must be at least 1")
        ),
        unitPrice: z.preprocess(
          (val) => Number(val),
          z.number().min(0.01, "Unit price must be greater than 0")
        ),
        taxRate: z.preprocess(
          (val) => Number(val),
          z.number().min(0, "Tax rate must be 0 or greater")
        ),
        totalAvailable: z.number().optional(),
      })
    )
    .min(1, "At least one product is required"),
  transactionType: z.enum(["debit", "credit"]),
  paymentMode: z.enum(["cash", "cheque", "upi", "online", "N/A"]).optional(),
  initialPayment: z
    .preprocess((val) => Number(val), z.number().min(0))
    .optional(),
  bankDetails: z.string().min(1, "Bank details are required"),
  signature: z.string().min(1, "Signature is required"),
  isRoundedOff: z.boolean().default(true),
  description: z.string().optional(),
});

function AddInvoiceControl({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [signatures, setSignatures] = useState([]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await axiosGet(FetchCustomerList);
      if (response.data.success) {
        setCustomers(response.data.value);
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch customers");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosGet(FetchProductListDropdownInvoice);
      if (response.data.success) {
        // Map product structure to make it easier to work with
        let mappedProducts = [];

        mappedProducts = (response.data.value?.products || []).map(
          (product) => ({
            ...product,
            totalAvailable: product.totalQuantity,
          })
        );

        setProducts(mappedProducts);
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch products");
    }
  }, []);

  const fetchBankDetails = useCallback(async () => {
    try {
      const response = await axiosGet(fetchCompanyBankDetails);
      if (response.data.success) {
        setBankDetails(response.data.value);
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch bank details");
    }
  }, []);

  const fetchSignatures = useCallback(async () => {
    try {
      const response = await axiosGet(fetchCompanySignatures);
      if (response.data.success) {
        setSignatures(response.data.value);
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to fetch signatures");
    }
  }, []);

  const createInvoice = async (data) => {
    try {
      setIsLoading(true);
      // Check for the print flag directly on the data object
      const isPrintAfterCreate = data._printAfterCreate === true;
      console.log("Creating invoice, print flag:", isPrintAfterCreate);

      const response = await axiosPost(CreateInvoice, data);
      console.log("API Response for invoice creation:", response);

      if (response.data.success) {
        showNotification.success("Invoice created successfully");

        // Only navigate to invoices if this is NOT a print action
        if (!isPrintAfterCreate) {
          console.log("Standard create - navigating to /invoices");
          navigate("/invoices");
        } else {
          console.log("Print action - letting component handle navigation");
        }

        return response.data;
      } else {
        showNotification.error(
          response.data.message || "Failed to create invoice"
        );
        return response.data;
      }
    } catch (error) {
      showNotification.error(
        error.response?.data?.message || "Failed to create invoice"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddInvoiceContext.Provider
      value={{
        invoiceSchema,
        isLoading,
        createInvoice,
        fetchCustomers,
        fetchProducts,
        fetchBankDetails,
        fetchSignatures,
        customers,
        products,
        bankDetails,
        signatures,
      }}
    >
      {children}
    </AddInvoiceContext.Provider>
  );
}

export default AddInvoiceControl;
