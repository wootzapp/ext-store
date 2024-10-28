---

# WootzApp Extensions Store 🚀

A sleek web interface for distributing Chrome extensions for WootzApp, crafted with React, Vite, and Tailwind CSS. Designed to showcase a vibrant UI with WootzApp's brand colors and modern effects.

---

## 🌈 Features

- **Beautiful Gradient UI**: Utilizes WootzApp's brand colors (`#CF1F2B`, `#F04D31`, `#FAA22E`) for a visually appealing experience.
- **Responsive Design**: Optimized for all devices.
- **Extension Cards**: Simple, intuitive cards with download buttons.
- **Glassmorphism Effects**: Adding depth and elegance.
- **Animated Gradients and Hover Effects**: Enhances user interactivity.

---

## 🚀 Getting Started

### 1. Fork and Clone the Repository

1. **Fork this repository**: Go to [https://github.com/wootzapp/ext-store](https://github.com/wootzapp/ext-store) and click the "Fork" button at the top-right to create a copy under your GitHub account.

2. **Clone your forked repository**:

   ```bash
   # Replace YOUR_USERNAME with your GitHub username
   git clone https://github.com/YOUR_USERNAME/ext-store.git
   ```

3. **Navigate to the project directory**:

   ```bash
   cd ext-store
   ```

### 2. Set Up the Project

Install the dependencies and set up the environment:

```bash
# Install project dependencies
npm install
```

### 3. Add Extensions

Add your extensions in `src/extensions.js`:

```javascript
export const extensions = [
  {
    name: "Your Extension",
    description: "Description of your extension",
    version: "1.0.0",
    filename: "your-extension/build.crx",
    image: "your-extension/icon128.png" // 128x128 icon
  }
];
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build and Preview for Production

To create a production build and preview it locally:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📂 Project Structure

```plaintext
ext-store/
├── public/
│   ├── logo.png
│   └── extensions/
│       └── your-extension/
│           ├── build.crx
│           └── icon128.png
├── src/
│   ├── App.jsx
│   ├── extensions.js
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```