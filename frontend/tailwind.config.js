export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        coral: "var(--coral)",
        coral2: "var(--coral2)",
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        card: "var(--card)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      boxShadow: {
        glow: "0 8px 24px rgba(232,83,58,.4)",
        heavy: "0 16px 40px rgba(0,0,0,.5)",
      },
      animation: {
        blob: "blob 6s ease-in-out infinite",
        spinR: "spinR 10s linear infinite",
        spinRrev: "spinR 18s linear infinite reverse",
        fadeUp: "fadeUp .7s ease .1s both",
        marquee: "marquee 20s linear infinite",
      },
      keyframes: {
        blob: {
          "0%,100%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.08) rotate(5deg)" },
        },
        spinR: {
          from: { transform: "rotate(0)" },
          to: { transform: "rotate(360deg)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
