/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                // Deep space theme colors
                deep: {
                    950: '#030014',
                    900: '#0a0118',
                    800: '#120225',
                },
            },
            animation: {
                'gradient-x': 'gradient-x 3s ease infinite',
                'shine': 'shine 1.5s linear infinite',
                'float-y': 'float-y 3s ease-in-out infinite',
                'float-slow': 'float-slow 25s infinite alternate ease-in-out',
                'float-reverse': 'float-reverse 30s infinite alternate-reverse ease-in-out',
                'pulse-glow': 'pulse-glow 20s infinite ease-in-out',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
                    '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
                },
                'shine': {
                    'from': { transform: 'translateX(-100%) skewX(-12deg)' },
                    'to': { transform: 'translateX(200%) skewX(-12deg)' },
                },
                'float-y': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'float-slow': {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '50%': { transform: 'translate(30px, 20px) scale(1.05)' },
                    '100%': { transform: 'translate(-20px, 40px) scale(1)' },
                },
                'float-reverse': {
                    '0%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '100%': { transform: 'translate(-40px, -20px) rotate(5deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.15', transform: 'scale(1)' },
                    '50%': { opacity: '0.25', transform: 'scale(1.2)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
