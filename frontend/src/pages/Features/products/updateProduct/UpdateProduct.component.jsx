import React from "react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProductContext } from "./UpdateProduct.controller";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/custom/FileUpload";
import { Skeleton } from "@/components/ui/skeleton";

function UpdateProductComponent() {
  const [productData, setProductData] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    categories,
    taxes,
    isLoading,
    productSchema,
    fetchCategories,
    fetchTaxes,
    updateProduct,
    updateProductImage,
    fetchProductDetails,
  } = useContext(UpdateProductContext);

  const navigate = useNavigate();
  const location = useLocation();
  const productSkuCode = location.state?.productSkuCode;

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: productData,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCategories();
        await fetchTaxes();
        const response = await fetchProductDetails(productSkuCode);

        // Transform the response data to match form field names
        const formData = {
          ...response,
          // Map the nested objects to their names
          categoryName: response.category?.name || "",
          taxName: response.taxRate?.name || "",
        };

        setProductData(response);
        form.reset(formData); // Set form values with transformed data
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (values) => {
    try {
      // First update the product details
      await updateProduct(values);

      // If there's a new image, update it separately
      if (croppedImage) {
        const imageFormData = new FormData();
        imageFormData.append("skuCode", values.skuCode);
        imageFormData.append("productImg", croppedImage);
        await updateProductImage(imageFormData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleImageUpdate = async () => {
    try {
      if (!croppedImage) return;

      const formData = new FormData();
      formData.append("skuCode", productData.skuCode);

      // Create a file from the blob with a specific filename
      const imageFile = new File([croppedImage], "product-image.jpg", {
        type: "image/jpeg",
        lastModified: new Date().getTime(),
      });

      // Append as 'productImg' - this name must match backend expectation
      formData.append("productImg", imageFile);

      // Debug log
      console.log("Sending formData:", {
        skuCode: productData.skuCode,
        imageType: imageFile.type,
        imageSize: imageFile.size,
      });

      const result = await updateProductImage(formData);
      if (result.success) {
        setCroppedImage(null);
        // Refresh the product data to show new image
        const updatedProduct = await fetchProductDetails(productData.skuCode);
        setProductData(updatedProduct);
      }
    } catch (error) {
      console.error("Image update error:", error);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px] mt-2" />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-8">
          {/* Product Details Form Skeleton */}
          <div>
            <Skeleton className="h-6 w-[150px] mb-4" />
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                {/* Basic Details Section */}
                <div className="space-y-4">
                  <Skeleton className="h-5 w-[100px]" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category and Price Section */}
                <div className="space-y-4 mt-6">
                  <Skeleton className="h-5 w-[140px]" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock and Tax Section */}
                <div className="space-y-4 mt-6">
                  <Skeleton className="h-5 w-[100px]" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions Skeleton */}
                <div className="flex justify-end gap-4 pt-4">
                  <Skeleton className="h-10 w-[100px]" />
                  <Skeleton className="h-10 w-[150px]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Management Skeleton */}
          <div>
            <Skeleton className="h-6 w-[150px] mb-4" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Skeleton className="h-6 w-[120px] mb-4" />
                      <Skeleton className="aspect-square w-full max-w-md" />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-[120px]" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/products")}
          className="hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Update Product</h2>
          <p className="text-sm text-muted-foreground">
            Update product details and image
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-8">
        {/* Product Details Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Product Details</h3>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Basic Details Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Basic Details
                    </Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skuCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter SKU code"
                                {...field}
                                disabled // SKU code shouldn't be editable
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Category and Price Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Category & Pricing
                    </Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Category Select */}
                      <FormField
                        control={form.control}
                        name="categoryName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""} // Add default empty string
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.name}
                                    value={category.name}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price Input */}
                      <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">
                                  ₹
                                </span>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-7"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Stock and Tax Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Stock & Tax
                    </Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="alertQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alert Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter alert quantity"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""} // Add default empty string
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tax rate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {taxes.map((tax) => (
                                  <SelectItem key={tax.name} value={tax.name}>
                                    {tax.name} ({tax.percent}%)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Product Details Form Actions */}
                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/products")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "min-w-[120px]",
                        isLoading && "animate-pulse"
                      )}
                    >
                      {isLoading ? "Updating..." : "Update Product Details"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Image Management Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Product Image</h3>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-4">
                      Current Image
                    </Label>
                    <div className="mt-2 aspect-square w-full max-w-md overflow-hidden rounded-lg border">
                      <img
                        src={productData?.productImg}
                        alt="Current product"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Update Image
                    </Label>
                    <FileUpload
                      onImageCropped={(croppedImg) => {
                        setCroppedImage(croppedImg);
                      }}
                      formData={{
                        productName: form.watch("name"),
                        categoryName: form.watch("categoryName"),
                      }}
                      enableAIGeneration={true}
                    />
                  </div>

                  {/* Image Update Button */}
                  {croppedImage && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleImageUpdate}
                        disabled={isLoading}
                        className={cn(
                          "min-w-[120px]",
                          isLoading && "animate-pulse"
                        )}
                      >
                        {isLoading ? "Updating..." : "Update Image"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Card - Only shows when there's a new image */}
            {croppedImage && (
              <div className="lg:sticky lg:top-6">
                <Card className="border-none shadow-md">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-lg font-semibold">
                      New Image Preview
                    </h3>
                    <div className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
                      <div className="aspect-square">
                        <img
                          src={URL.createObjectURL(croppedImage)}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProductComponent;

