import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', 'monospace'],
      },
      colors: {
        threat:  '#ff2d2d',
        success: '#00ff41',
        dim:     '#1a1a2e',
        panel:   '#0a0a14',
        base:    '#05050f',
      },
      animation: {
        'glitch': 'glitch-high 0.4s infinite',
        'scanline': 'scanline-move 8s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
