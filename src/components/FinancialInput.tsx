import { useEffect, useState } from "react";
import { toInputValue } from "../utils/formatters";

type FinancialInputProps = {
  id: string;
  label: string;
  value: number;
  hasValue: boolean;
  isNull?: boolean;
  onChange: (amount: number | null) => void;
};

const validAmountPattern = /^(?:\d+\.?\d*|\.\d+)$/;

export function FinancialInput({
  id,
  label,
  value,
  hasValue,
  isNull = false,
  onChange,
}: FinancialInputProps) {
  const [inputValue, setInputValue] = useState(getDisplayValue(value, hasValue, isNull));
  const [isInvalid, setIsInvalid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) {
      return;
    }

    setInputValue(getDisplayValue(value, hasValue, isNull));
    setIsInvalid(false);
  }, [hasValue, isFocused, isNull, value]);

  return (
    <span className="financial-input-wrap">
      <label className={isInvalid ? "financial-input is-invalid" : "financial-input"} htmlFor={id}>
        <span className="currency-mark">$</span>
        <input
          id={id}
          aria-label={label}
          aria-invalid={isInvalid}
          inputMode="decimal"
          type="text"
          value={inputValue}
          placeholder="None"
          onBlur={() => setIsFocused(false)}
          onChange={(event) => {
            const nextValue = event.target.value.trim();
            setInputValue(nextValue);

            if (nextValue === "") {
              setIsInvalid(false);
              onChange(null);
              return;
            }

            if (!validAmountPattern.test(nextValue)) {
              setIsInvalid(true);
              return;
            }

            setIsInvalid(false);
            onChange(Number(nextValue));
          }}
          onFocus={() => setIsFocused(true)}
        />
      </label>
      {isInvalid && <span className="input-warning">Invalid number</span>}
    </span>
  );
}

function getDisplayValue(value: number, hasValue: boolean, isNull: boolean): string {
  if (!hasValue || isNull) {
    return "";
  }

  return toInputValue(value);
}
