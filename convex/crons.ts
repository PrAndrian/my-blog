import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Schedule the weekly digest to run every Monday at 00:00 UTC
crons.weekly(
  "Weekly Digest",
  { hourUTC: 0, minuteUTC: 0, dayOfWeek: "monday" },
  api.digest.generateWeeklyDigest
);

export default crons;
