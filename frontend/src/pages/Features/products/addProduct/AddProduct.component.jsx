import React from "react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AddProductContext } from "./AddProduct.control";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, SparkleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/custom/FileUpload";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShimmerButton } from "@/components/ui/shimmer-button";

function AddProductComponent() {
  const {
    categories,
    taxes,
    isLoading,
    productSchema,
    fetchCategories,
    fetchTaxes,
    createProduct,
  } = useContext(AddProductContext);

  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      skuCode: "",
      categoryName: "",
      salePrice: "",
      alertQuantity: "",
      taxName: "",
      productImg: null,
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchTaxes();
  }, [fetchCategories, fetchTaxes]);

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Add all text fields
      Object.keys(values).forEach((key) => {
        if (key !== "productImg") {
          formData.append(key, values[key]);
        }
      });

      // Add the image file if it exists
      if (croppedImage) {
        // Convert blob to file with proper name
        const imageFile = new File([croppedImage], "product-image.jpg", {
          type: "image/jpeg",
        });
        formData.append("productImg", imageFile);
      }

      await createProduct(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50/50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/products")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
          <p className="text-sm text-muted-foreground">
            Create a new product with details and image
          </p>
        </div>
      </div>

      <Separator />

      {/* Form Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                            <Input placeholder="Enter SKU code" {...field} />
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
                    <FormField
                      control={form.control}
                      name="categoryName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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

                    <FormField
                      control={form.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Sale Price</FormLabel>
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
                  <Label className="text-base font-semibold">Stock & Tax</Label>
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
                            defaultValue={field.value}
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
                  {/* Image Upload Section */}
                  <FormField
                    control={form.control}
                    name="productImg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        <FormControl>
                          <FileUpload
                            onImageCropped={(croppedImg) => {
                              setCroppedImage(croppedImg);
                              field.onChange(croppedImg);
                            }}
                            formData={{
                              productName: form.watch("name"),
                              categoryName: form.watch("categoryName"),
                            }}
                            enableAIGeneration="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                    {isLoading ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <div className="lg:sticky lg:top-6">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <h3 className="mb-6 text-lg font-semibold">Product Preview</h3>
              {croppedImage ? (
                <div className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
                  <div className="aspect-square">
                    <img
                      src={URL.createObjectURL(croppedImage)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium">
                      {form.watch("name") || "Product Name"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {form.watch("skuCode") || "SKU Code"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ₹{form.watch("salePrice") || "0.00"}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {form.watch("categoryName") || "Category"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 dark:bg-zinc-800">
                  <p className="text-sm text-gray-500">
                    Upload an image to see preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AddProductComponent;
