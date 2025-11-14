import { useEffect, useState, ReactNode } from "react";

export function AfterSSR({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  // Hydration-safe rendering pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
  }, []);
  if (!show) {
    return null;
  }
  return children;
}
