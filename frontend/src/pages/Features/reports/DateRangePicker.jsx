import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, setMonth, setYear } from "date-fns";
import { CalendarIcon } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const START_YEAR = 2020;

function DateRangePicker({ dateRange, onDateRangeChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - START_YEAR + 1 },
    (_, i) => START_YEAR + i,
  );

  const [displayMonth, setDisplayMonth] = useState(new Date());

  const handleMonthSelect = (monthStr) => {
    setDisplayMonth((prev) => setMonth(prev, parseInt(monthStr)));
  };

  const handleYearSelect = (yearStr) => {
    setDisplayMonth((prev) => setYear(prev, parseInt(yearStr)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !dateRange.from && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Select
            value={String(displayMonth.getMonth())}
            onValueChange={handleMonthSelect}
          >
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, i) => (
                <SelectItem key={month} value={String(i)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(displayMonth.getFullYear())}
            onValueChange={handleYearSelect}
          >
            <SelectTrigger className="h-8 w-[90px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
