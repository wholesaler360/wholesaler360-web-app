import { createContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosGet, axiosPost } from "@/constants/api-context";
import {
  CreateProduct,
  FetchAllCategories,
  FetchAllTaxes,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import * as z from "zod";

export const AddProductContext = createContext({});

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  skuCode: z.string().min(2, "SKU code must be at least 2 characters"),
  categoryName: z.string().min(1, "Please select a category"),
  salePrice: z.number().min(0, "Price must be greater than 0"),
  alertQuantity: z.number().min(0, "Alert quantity must be greater than 0"),
  taxName: z.string().min(1, "Please select a tax option"),
  productImg: z
    .any()
    .refine((file) => file instanceof Blob, "Please upload an image")
    .refine((file) => file.size <= 5242880, "Image must be less than 5MB"),
});

export function AddProductController({ children }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosGet(FetchAllCategories);
      if (response.success) {
        setCategories(response.value.categories);
      } else {
        throw new Error(response || "Failed to fetch categories");
      }
    } catch (error) {
      if (response.statusCode === 404) {
        navigate("/products");
        showNotification.error(
          "No categories found. Please add a category first"
        );
      } else {
        navigate("/products");
        showNotification.error("Failed to fetch categories");
      }
    }
  }, []);

  const fetchTaxes = useCallback(async () => {
    try {
      const response = await axiosGet(FetchAllTaxes);
      if (response.success) {
        setTaxes(response.value.taxes);
      }
    } catch (error) {
      showNotification.error("Failed to fetch tax options");
    }
  }, []);

  const createProduct = async (formData) => {
    try {
      setIsLoading(true);
      for (let [key, value] of formData.entries()) {
      }
      const response = await axiosPost(CreateProduct, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) {
        showNotification.success("Product created successfully");
        navigate("/products");
      } else {
        throw new Error(response.data.message || "Failed to create product");
      }
    } catch (error) {
      showNotification.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddProductContext.Provider
      value={{
        categories,
        taxes,
        isLoading,
        productSchema,
        fetchCategories,
        fetchTaxes,
        createProduct,
      }}
    >
      {children}
    </AddProductContext.Provider>
  );
}
