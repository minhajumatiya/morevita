/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'more-green': '#2D5A27',
                'more-gold': '#FFC107',
            }
        },
    },
    plugins: [],
}