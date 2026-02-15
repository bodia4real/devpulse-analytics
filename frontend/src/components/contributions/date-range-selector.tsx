"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DateRangeSelectorProps {
  value: number;
  onChange: (days: number) => void;
}

const options = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value.toString()}
      onValueChange={(v) => v && onChange(Number(v))}
      className="justify-start"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value.toString()}
          className="text-sm"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
