import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        status: {
          possible: "#9CA3AF",
          probable: "#F5B942",
          confirmed: "#22A06B",
          cancelled: "#E5484D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
