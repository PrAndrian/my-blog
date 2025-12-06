import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Schedule the digest check to run every day at 00:00 UTC
// The action itself will check if it's the correct day to run
crons.daily(
  "Daily Digest Check",
  { hourUTC: 0, minuteUTC: 0 },
  api.digest.generateWeeklyDigest,
  {}
);

export default crons;
