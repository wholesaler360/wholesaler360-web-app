import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosGet } from "@/constants/api-context";
import { FetchPurchaseById } from "@/constants/apiEndPoints";
import { showNotification } from "@/core/toaster/toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PurchaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosGet(FetchPurchaseById(id));
        if (response?.data?.success) {
          setPurchase(response.data.value);
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch purchase details"
          );
        }
      } catch (error) {
        showNotification.error(
          error.response?.data?.message || "Failed to load purchase details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPurchaseDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Purchase not found</h2>
        <Button onClick={() => navigate("/purchases")}>
          Back to Purchases
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/purchases")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Purchase Details
            </h1>
            <p className="text-sm text-muted-foreground">
              View details for purchase #{purchase.purchaseNo}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Purchase No</p>
                <p className="font-medium">{purchase.purchaseNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">
                  {formatDate(purchase.purchaseDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">
                  ₹{purchase.totalAmount?.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Initial Payment</p>
                <p className="font-medium">
                  ₹{purchase.initialPayment?.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Transaction Type
                </p>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    purchase.transactionType === "credit"
                      ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                      : "bg-green-50 text-green-700 ring-green-600/20"
                  }`}
                >
                  {purchase.transactionType}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Mode</p>
                <p className="capitalize font-medium">{purchase.paymentMode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="font-medium">
                  {purchase.createdBy?.name || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vendor Name</p>
                <p className="font-medium">
                  {purchase.vendorId?.name || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Unit Price</th>
                  <th className="px-4 py-2 text-left">Tax Rate</th>
                  <th className="px-4 py-2 text-left">Tax Amount</th>
                  <th className="px-4 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchase.products?.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3">{product.id?.name}</td>
                    <td className="px-4 py-3">{product.quantity}</td>
                    <td className="px-4 py-3">
                      ₹{product.unitPrice?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">{product.taxRate}%</td>
                    <td className="px-4 py-3">
                      ₹{product.taxAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      ₹{product.amount?.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-right font-medium">
                    Total Tax:
                  </td>
                  <td className="px-4 py-2 font-medium">
                    ₹{purchase.totalTax?.toLocaleString("en-IN")}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-right font-medium">
                    Grand Total:
                  </td>
                  <td className="px-4 py-2 font-bold">
                    ₹{purchase.totalAmount?.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PurchaseDetails;
