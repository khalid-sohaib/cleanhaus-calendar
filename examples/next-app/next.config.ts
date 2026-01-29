import type { NextConfig } from "next";

const withCalendar = require("@khalid-sohaib/calendar/next-plugin");

const nextConfig: NextConfig = {};

export default withCalendar(nextConfig);
