import { useEffect, useRef } from "react";
import { ANIMATION } from "@/lib/constants";

export function useAnnouncement(announcement: string) {
  const announcementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (announcement && announcementRef.current) {
      announcementRef.current.textContent = announcement;
      timeoutRef.current = setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, ANIMATION.ANNOUNCEMENT_DURATION);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [announcement]);

  return announcementRef;
}
