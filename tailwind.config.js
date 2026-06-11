import preset from '@huangqianmin/design-system/preset'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../design-system/src/components/**/*.{js,ts,jsx,tsx}',
    '../design-system/src/tokens/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
