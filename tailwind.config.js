/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            fontFamily: {
                ubuntu: ["Ubuntu mono", "monospace"],
                lexend: ["Lexend", "sans-serif"],
            },
        },
    },
    plugins: [],
};
