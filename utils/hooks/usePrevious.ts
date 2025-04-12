import React from "react";

export function usePrevious<T>(value: T): T {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const ref: any = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
