export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f3fbef",
          100: "#e3f5dc",
          200: "#c7eab8",
          300: "#9bd982",
          400: "#69bd50",
          500: "#3f9f30",
          600: "#2e7f24",
          700: "#26651f",
          800: "#22511d",
          900: "#1d431a"
        },
        cream: "#fbf8ef",
        ink: "#101610"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(26, 70, 31, 0.12)",
        card: "0 10px 24px rgba(31, 49, 32, 0.08)"
      }
    },
  },
  plugins: [],
};
