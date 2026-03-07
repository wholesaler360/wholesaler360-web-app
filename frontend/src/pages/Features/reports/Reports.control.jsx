import { createContext, useState, useCallback, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { axiosGet } from "@/constants/api-context";
import DataTableColumnHeader from "@/components/datatable/DataTableColumnHeader";
import { REPORT_TYPES } from "./reportConfig";
import { startOfDay, endOfDay, isWithinInterval } from "date-fns";

export const ReportsContext = createContext({});

function ReportsController({ children }) {
  const [selectedType, setSelectedType] = useState("");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchReportData = useCallback(async () => {
    if (!selectedType) return;
    const config = REPORT_TYPES[selectedType];
    if (!config) return;

    setIsLoading(true);
    setHasFetched(true);
    try {
      const response = await axiosGet(config.endpoint);
      if (response.data.success) {
        const data = config.responseExtractor
          ? config.responseExtractor(response.data)
          : response.data.value || [];
        setRawData(data);
      } else {
        setRawData([]);
      }
    } catch (error) {
      setRawData([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedType]);

  const filteredData = useMemo(() => {
    const config = REPORT_TYPES[selectedType];
    if (!config || !config.dateField || !dateRange.from) return rawData;

    return rawData.filter((row) => {
      const rowDate = new Date(row[config.dateField]);
      if (isNaN(rowDate.getTime())) return false;
      const from = startOfDay(dateRange.from);
      const to = dateRange.to
        ? endOfDay(dateRange.to)
        : endOfDay(dateRange.from);
      return isWithinInterval(rowDate, { start: from, end: to });
    });
  }, [rawData, dateRange, selectedType]);

  const columns = useMemo(() => {
    const config = REPORT_TYPES[selectedType];
    if (!config) return [];

    const columnHelper = createColumnHelper();
    return config.columns.map((col) => {
      const colDef = col.accessor
        ? columnHelper.accessor(col.accessor, { id: col.key })
        : columnHelper.accessor(col.key, {});

      return {
        ...colDef,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={col.header} />
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          if (col.type === "date") {
            const date = new Date(value);
            if (isNaN(date.getTime())) return <span>-</span>;
            return (
              <span className="text-muted-foreground">
                {date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            );
          }
          if (col.type === "currency") {
            return (
              <span className="font-medium">
                ₹{Number(value).toLocaleString("en-IN")}
              </span>
            );
          }
          return <span>{value ?? "-"}</span>;
        },
      };
    });
  }, [selectedType]);

  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
    setRawData([]);
    setDateRange({ from: undefined, to: undefined });
    setHasFetched(false);
  }, []);

  return (
    <ReportsContext.Provider
      value={{
        selectedType,
        setSelectedType: handleTypeChange,
        dateRange,
        setDateRange,
        filteredData,
        isLoading,
        hasFetched,
        fetchReportData,
        columns,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export default ReportsController;
