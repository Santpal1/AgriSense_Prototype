/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    safelist: [
        // Ensure color classes are included
        {
            pattern: /bg-(red|green|blue|yellow|purple|orange|gray)-(50|100|200|300|400|500|600|700|800|900)/,
        },
        {
            pattern: /text-(red|green|blue|yellow|purple|orange|gray)-(50|100|200|300|400|500|600|700|800|900)/,
        },
        {
            pattern: /border-(red|green|blue|yellow|purple|orange|gray)-(50|100|200|300|400|500|600|700|800|900)/,
        }
    ]
}