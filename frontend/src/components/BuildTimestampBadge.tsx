import { useEffect, useState } from "react";

export function BuildTimestampBadge() {
  const [displayText, setDisplayText] = useState("Build time unavailable");

  useEffect(() => {
    fetch("/build-metadata.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch build metadata");
        return res.json();
      })
      .then((data) => {
        const timestamp = data.timestamp;
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
        setDisplayText(`Built: ${formatted}`);
      })
      .catch(() => {
        // Leave as "Build time unavailable"
      });
  }, []);

  return (
    <span className="inline-block py-1 px-3 bg-surface border border-border rounded text-sm text-text-dim font-mono">
      {displayText}
    </span>
  );
}
