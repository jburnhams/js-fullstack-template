import { useEffect, useRef } from "react";

interface BuildTimestampBadgeProps {
  timestamp?: string;
}

export function BuildTimestampBadge({
  timestamp = "__BUILD_TIMESTAMP__",
}: BuildTimestampBadgeProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const span = spanRef.current;
    if (!span || !timestamp) {
      return;
    }

    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return;
      }
      const formatted = date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZoneName: "short",
      });
      span.textContent = `Built: ${formatted}`;
    } catch {
      // Leave as "Build time unavailable"
    }
  }, [timestamp]);

  return (
    <span className="inline-block py-1 px-3 bg-surface border border-border rounded text-sm text-text-dim font-mono" ref={spanRef}>
      Build time unavailable
    </span>
  );
}
