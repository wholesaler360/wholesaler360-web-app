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
  const [filterValues, setFilterValues] = useState({});
  const [activePreset, setActivePreset] = useState("custom");

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

  const dynamicFilterOptions = useMemo(() => {
    const config = REPORT_TYPES[selectedType];
    if (!config?.filters) return {};

    const optionsMap = {};
    config.filters.forEach((filter) => {
      if (filter.dynamic) {
        const uniqueValues = [
          ...new Set(
            rawData
              .map((row) => row[filter.key])
              .filter((v) => v !== null && v !== undefined && v !== ""),
          ),
        ].sort();
        optionsMap[filter.key] = uniqueValues.map((v) => ({
          value: String(v),
          label: String(v),
        }));
      }
    });
    return optionsMap;
  }, [rawData, selectedType]);

  const filteredData = useMemo(() => {
    const config = REPORT_TYPES[selectedType];
    if (!config) return rawData;

    let data = rawData;

    // Date filtering
    if (config.dateField && dateRange.from) {
      data = data.filter((row) => {
        const rowDate = new Date(row[config.dateField]);
        if (isNaN(rowDate.getTime())) return false;
        const from = startOfDay(dateRange.from);
        const to = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);
        return isWithinInterval(rowDate, { start: from, end: to });
      });
    }

    // Type-specific filters
    if (config.filters) {
      config.filters.forEach((filter) => {
        const selectedValue = filterValues[filter.key];
        if (!selectedValue) return;

        if (filter.filterFn) {
          data = data.filter((row) => filter.filterFn(row, selectedValue));
        } else {
          data = data.filter(
            (row) => String(row[filter.key]) === selectedValue,
          );
        }
      });
    }

    return data;
  }, [rawData, dateRange, selectedType, filterValues]);

  const activeFilters = useMemo(() => {
    const config = REPORT_TYPES[selectedType];
    if (!config?.filters) return [];

    return config.filters
      .filter((f) => filterValues[f.key])
      .map((f) => {
        const selectedValue = filterValues[f.key];
        const options = f.dynamic
          ? dynamicFilterOptions[f.key] || []
          : f.options || [];
        const option = options.find((o) => o.value === selectedValue);
        return {
          label: f.label,
          value: option ? option.label : selectedValue,
        };
      });
  }, [selectedType, filterValues, dynamicFilterOptions]);

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
    setFilterValues({});
    setActivePreset("custom");
  }, []);

  const handleFilterChange = useCallback((filterKey, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({});
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
        filterValues,
        handleFilterChange,
        clearFilters,
        dynamicFilterOptions,
        activeFilters,
        activePreset,
        setActivePreset,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export default ReportsController;
