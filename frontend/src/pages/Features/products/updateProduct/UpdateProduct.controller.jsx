import { createContext, useState, useCallback } from "react";
import { axiosGet, axiosPost, axiosPut } from "@/constants/api-context";
import {
  UpdateProduct,
  UpdateProductImage,
  FetchAllCategories,
  FetchAllTaxes,
  FetchProduct,
} from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

const UpdateProductContext = createContext({});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  skuCode: z.string().min(1, "SKU code is required"),
  categoryName: z.string().min(1, "Category is required"),
  salePrice: z.number().min(0, "Price must be positive"),
  alertQuantity: z.number().min(0, "Alert quantity must be positive"),
  taxName: z.string().min(1, "Tax rate is required"),
  productImg: z.any().optional(),
});

function UpdateProductController({ children }) {
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProductDetails = useCallback(async (productSkuCode) => {
    try {
      setIsLoading(true);
      const response = await axiosPost(FetchProduct, {
        skuCode: productSkuCode,
      });
      return response.data.value;
    } catch (error) {
      showNotification.error("Failed to fetch product details");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosGet(FetchAllCategories);
      if (response.success) {
        setCategories(response.value.categories);
      }
    } catch (error) {
      showNotification.error("Failed to fetch categories");
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

  const updateProduct = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosPut(UpdateProduct, data);
      showNotification.success("Product updated successfully");
      navigate("/products");
      return response;
    } catch (error) {
      showNotification.error(error.message || "Failed to update product");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductImage = async (formData) => {
    try {
      setIsLoading(true);
      
      // Debug logging
      console.log('FormData contents before sending:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await axiosPut(UpdateProductImage, formData);

      if (response.status === 200) {
        showNotification.success("Product image updated successfully");
        return { success: true, data: response.data };
      }
      
      throw new Error(response.data?.message || "Failed to update image");
    } catch (error) {
      console.error('Image upload error:', error);
      showNotification.error(error.message || "Failed to update product image");
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UpdateProductContext.Provider
      value={{
        categories,
        taxes,
        isLoading,
        productSchema,
        fetchCategories,
        fetchTaxes,
        updateProduct,
        updateProductImage,
        fetchProductDetails,
      }}
    >
      {children}
    </UpdateProductContext.Provider>
  );
}

export { UpdateProductContext, UpdateProductController };
