import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "./Dashboard.control";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  PieChart,
  Wallet,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { showNotification } from "@/core/toaster/toast";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import * as RechartsPrimitive from "recharts";
const { BarChart, Bar, XAxis, YAxis } = RechartsPrimitive;

// Add this color configuration at the top
const CARD_STYLES = {
  purchase: {
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    trendColor: "text-blue-600"
  },
  pending: {
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    trendColor: "text-amber-600"
  },
  sales: {
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    trendColor: "text-emerald-600"
  },
  collection: {
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    trendColor: "text-purple-600"
  }
};

function MetricCard({ title, value, subtitle, icon: Icon, trend, variant }) {
  const styles = CARD_STYLES[variant];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-full p-2 ${styles.bgColor}`}>
          <Icon className={`h-4 w-4 ${styles.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">₹{value?.toLocaleString("en-IN")}</div>
          {trend && (
            <div className={`flex items-center text-sm ${styles.trendColor}`}>
              <ArrowUpRight className="h-4 w-4" />
              {trend}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardComponent() {
  const { getDashboardData, getAlertProducts, getBestSellingProducts } = useContext(DashboardContext);
  const [metrics, setMetrics] = useState(null);
  const [alertProducts, setAlertProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [years, setYears] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, alertRes, salesRes] = await Promise.all([
          getDashboardData(),
          getAlertProducts(),
          getBestSellingProducts()
        ]);
        
        if (metricsRes.success) setMetrics(metricsRes.value);
        if (alertRes.success) setAlertProducts(alertRes.value.filter(p => p.alert));
        if (salesRes.success) {
          setSalesData(salesRes.value);
          setYears(salesRes.value.map(d => d.year));
          setSelectedYear(salesRes.value[0]?.year);
        }
      } catch (error) {
        showNotification.error("Failed to fetch dashboard data");
      }
    };
    fetchData();
  }, [getDashboardData, getAlertProducts, getBestSellingProducts]);

  const prepareChartData = (year) => {
    const yearData = salesData.find(d => d.year === year)?.months || [];
    return yearData.map(month => {
      const monthName = new Date(2024, month.month - 1).toLocaleString('default', { month: 'short' });
      return {
        name: monthName,
        ...month.products.reduce((acc, product) => ({
          ...acc,
          [product.productName]: product.totalQuantitySold
        }), {})
      };
    });
  };

  const chartConfig = {
    product1: {
      theme: {
        light: "hsl(142, 76%, 36%)", // Green
        dark: "hsl(142, 76%, 36%)",
      },
      label: "Product 1",
    },
    product2: {
      theme: {
        light: "hsl(221, 83%, 53%)", // Blue
        dark: "hsl(221, 83%, 53%)",
      },
      label: "Product 2",
    },
  };

  if (!metrics) return null;

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div>
        <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time overview of your business metrics
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Purchase Paid"
            value={metrics?.purchaseData.totalPaid}
            trend="+12.5%"
            icon={Wallet}
            variant="purchase"
          />
          <MetricCard 
            title="Purchase Pending"
            value={metrics?.purchaseData.totalUnpaid}
            icon={CreditCard}
            variant="pending"
          />
          <MetricCard 
            title="Sales Revenue"
            value={metrics?.salesData.totalPaid}
            trend="+8.2%"
            icon={DollarSign}
            variant="sales"
          />
          <MetricCard 
            title="Pending Collection"
            value={metrics?.salesData.totalUnpaid}
            icon={PieChart}
            variant="collection"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle>Stock Alerts</CardTitle>
                </div>
                <Badge variant="secondary">
                  {alertProducts.length} items need attention
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertProducts.map((product) => (
                <Alert key={product.productName} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{product.productName}</span>
                      <p className="text-sm">Critical Stock Level</p>
                    </div>
                    <Badge variant="destructive">
                      {product.quantity} units
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Sales Performance</CardTitle>
                </div>
                <Select
                  value={selectedYear?.toString()}
                  onValueChange={(v) => setSelectedYear(Number(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-6">
                <ChartContainer 
                  config={chartConfig}
                  className="h-full w-full"
                >
                  <BarChart data={prepareChartData(selectedYear)}>
                    <XAxis
                      dataKey="name"
                      stroke="currentColor"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="currentColor"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload) return null;
                        return (
                          <ChartTooltipContent
                            payload={payload}
                            nameKey="name"
                            labelKey="name"
                            labelFormatter={(label) => label}
                          />
                        );
                      }}
                    />
                    <ChartLegend
                      content={
                        <ChartLegendContent verticalAlign="top" />
                      }
                    />
                    {Object.keys(prepareChartData(selectedYear)[0] || {})
                      .filter(key => key !== 'name')
                      .map((dataKey, index) => (
                        <Bar
                          key={dataKey}
                          dataKey={dataKey}
                          fill={index % 2 === 0 ? "#22c55e" : "#3b82f6"}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardComponent;
