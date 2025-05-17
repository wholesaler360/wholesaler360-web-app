import React, { useContext, useEffect, useState } from "react";
import { StockContext } from "../Stock.control";
import { showNotification } from "@/core/toaster/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function BatchList({ productId }) {
  const { getBatches, updateBatchPrice } = useContext(StockContext);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true);
        const response = await getBatches(productId);
        if (response?.success) {
          setBatches(response.value.batches || []);
          setProductDetails({
            name: response.value.productName,
            skuCode: response.value.skuCode,
          });
        }
      } catch (error) {
        showNotification.error(error?.response?.data?.message || "Failed to fetch batches");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, [productId, getBatches, refreshTrigger]);

  const handleEditClick = (batch) => {
    setEditingBatch(batch.batchId);
    setNewPrice(batch.salePriceWithoutTax.toString());
  };

  const handleCancelEdit = () => {
    setEditingBatch(null);
    setNewPrice("");
  };

  const handleSaveEdit = async (batchId) => {
    try {
      if (
        !newPrice ||
        isNaN(parseFloat(newPrice)) ||
        parseFloat(newPrice) <= 0
      ) {
        showNotification.error("Please enter a valid price");
        return;
      }

      setIsUpdating(true);
      const data = {
        batchId,
        sellingPrice: parseFloat(newPrice),
      };

      const response = await updateBatchPrice(data);
      if (response?.success) {
        showNotification.success("Selling price updated successfully");
        // Trigger a refresh of the batch data
        setRefreshTrigger((prev) => prev + 1);
        setEditingBatch(null);
        setNewPrice("");
      } else if (response?.value === null && response?.message) {
        showNotification.error(response.message);
      } else {
        showNotification.error("Failed to update selling price");
      }
    } catch (error) {
      showNotification.error(error?.response?.data?.message || "Failed to update selling price");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch List</CardTitle>
      </CardHeader>
      <CardContent>
        {batches.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch No</TableHead>
                <TableHead>Purchase No</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Purchase Price (₹)</TableHead>
                <TableHead>Selling Price (₹)</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.batchId}>
                  <TableCell>{batch.batchNo}</TableCell>
                  <TableCell>{batch.purchaseNo}</TableCell>
                  <TableCell>
                    {batch.purchaseDate
                      ? format(new Date(batch.purchaseDate), "dd/MM/yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{batch.vendorName || "N/A"}</TableCell>
                  <TableCell>₹{batch.purchasePrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {editingBatch === batch.batchId ? (
                      <Input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    ) : batch.isSalePriceEntered ? (
                      `₹${batch.salePriceWithoutTax.toFixed(2)}`
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-500 border-amber-500"
                      >
                        Not Set
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        batch.currentQuantity > 0 ? "success" : "destructive"
                      }
                    >
                      {batch.currentQuantity}
                    </Badge>
                  </TableCell>
                  <TableCell>{batch.createdBy || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {editingBatch === batch.batchId ? (
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(batch.batchId)}
                          disabled={isUpdating}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(batch)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No batches found for this product.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
