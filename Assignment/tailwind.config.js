/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'welcome-text-h2': '#351B4B',
        'welcome-text-h1': '#693696',
        'divider':'#B3B3B3',
        'divider-line':'#ddd',
        'social-button':'#693696', //login buton,sign up text link , socail button hover background,socail button color and border color , 
        'signup-text':'#555',
        'signup-text-span':'#1A0D26',
        'login-button-hover':'#5e36b0',
        'admin-bg-color':"#E3CDF43D",
        'view-button-bg-color':"#4D1B83",
        "input-field-color":"#F9F9F9",
        "button-bg-color":"#4D1B83"
        
      }
    },
   
  },
  plugins: [],
  
}

