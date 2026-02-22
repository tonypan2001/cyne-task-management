import type { Config } from "tailwindcss";

const config: Config = {
    // บังคับให้ระบบมองหา class "dark" เท่านั้นถึงจะเปลี่ยนสี 
    // ซึ่งถ้าเราไม่ใส่ class นี้ไว้ที่ <html> มันก็จะขาวสะอาดตลอดไป
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-line-seed)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;