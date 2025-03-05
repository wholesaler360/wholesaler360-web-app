import { createContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosGet, axiosPost } from "@/constants/api-context";
import { CreatePurchase, FetchVendorList, FetchProductListDropdown } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AddPurchaseContext = createContext({});

const purchaseSchema = z.object({
  purchaseDate: z.date({
    required_error: "Purchase date is required",
  }),
  vendorId: z.string().min(1, "Vendor is required"),
  products: z.array(z.object({
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
  })).min(1, "At least one product is required"),
  transactionType: z.enum(["debit", "credit"]),
  paymentMode: z.enum(["cash", "cheque", "upi", "online", "N/A"]).optional(),
  initialPayment: z.number().min(0).optional(),
});

function AddPurchaseControl({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchVendors = useCallback(async () => {
    try {
      const response = await axiosGet(FetchVendorList);
      if (response.data.success) {
        setVendors(response.data.value);
      }
    } catch (error) {
      showNotification.error("Failed to fetch vendors");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axiosGet(FetchProductListDropdown);
      if (response.data.success) {
        setProducts(response.data.value.product);
      }
    } catch (error) {
      showNotification.error("Failed to fetch products");
    }
  }, []);

  const createPurchase = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPost(CreatePurchase, data);
      if (response.status === 201) {
        showNotification.success("Purchase created successfully");
        navigate("/purchases");
      }
    } catch (error) {
      showNotification.error(error.response?.data?.message || "Failed to create purchase");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddPurchaseContext.Provider
      value={{
        purchaseSchema,
        isLoading,
        createPurchase,
        fetchVendors,
        fetchProducts,
        vendors,
        products,
      }}
    >
      {children}
    </AddPurchaseContext.Provider>
  );
}

export default AddPurchaseControl;
