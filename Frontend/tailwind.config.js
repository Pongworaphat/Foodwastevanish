export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      animation: {
        fadeIn: "fadeIn 1.2s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },

          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

    },
  },

  plugins: [],

  theme: {
    extend: {
      fontFamily: {
        sans: ['LINE Seed Sans TH', 'sans-serif'],
      },
    },
  },
}