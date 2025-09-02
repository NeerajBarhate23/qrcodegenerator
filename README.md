# QR Code Generator with Static Redirect System

A modern QR code generator featuring a static redirect system that allows you to change QR destinations without changing the QR code pattern.

## 🌟 Features

- **Multi-QR Management**: Create, save, edit, and manage multiple QR codes
- **Static Redirect System**: QR codes that never change but destinations can be updated
- **Customizable Design**: 
  - Multiple sizes (200px, 400px, 800px)
  - Custom colors for foreground and background
  - Transparent background support
  - Error correction levels
- **Export Options**: Download as PNG or SVG
- **Dark Mode**: Beautiful cream-themed UI with dark mode support
- **Responsive Design**: Works on desktop and mobile devices
- **No Server Required**: Pure client-side application

## 🚀 Live Demo

- **Main Application**: https://neerajbarhate23.github.io/qrcodegenerator/qr.html
- **Redirect Handler**: https://neerajbarhate23.github.io/qrcodegenerator/redirect.html

## 📋 How to Use

### Basic QR Code Generation
1. Open `qr.html` in your browser
2. Enter text or URL in the input field
3. Customize size, colors, and error correction
4. Download as PNG or SVG

### Static Redirect System
1. Check "Enable Static QR System"
2. Enter your destination URL
3. The QR code will point to a permanent redirect URL
4. Change the destination anytime without regenerating the QR code

## 🔧 Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/NeerajBarhate23/qrcodegenerator.git
   cd qrcodegenerator
   ```

2. Open `qr.html` in your browser or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

## 🌐 GitHub Pages Deployment

This project is configured for GitHub Pages deployment:

1. Push your changes to the `main` branch
2. Go to repository Settings → Pages
3. Select "Deploy from a branch" and choose `main` branch
4. Your site will be available at: `https://neerajbarhate23.github.io/qrcodegenerator/`

## 📁 File Structure

```
├── qr.html          # Main QR code generator interface
├── script.js        # Application logic and QR generation
├── styles.css       # Custom styling and animations
├── redirect.html    # Static redirect handler
└── README.md        # This file
```

## 🎨 Customization

### Changing Colors
The app uses a cream color theme defined in Tailwind config within `qr.html`. You can modify the color palette by updating the Tailwind configuration.

### Adding New Features
- QR generation: Modify `generateQR()` function in `script.js`
- UI components: Update the Alpine.js templates in `qr.html`
- Styling: Add custom CSS to `styles.css`

## 🔄 How Static Redirects Work

1. **QR Generation**: Creates QR codes pointing to `https://neerajbarhate23.github.io/qrcodegenerator/redirect.html?id=UNIQUE_ID`
2. **Destination Storage**: Saves destination mappings in browser localStorage
3. **Redirect Process**: When scanned, `redirect.html` looks up the destination and redirects the user
4. **Updates**: Change destinations without changing the QR code pattern

## 🛠️ Technical Details

- **Framework**: Alpine.js for reactive components
- **Styling**: Tailwind CSS with custom cream theme
- **QR Library**: qrcode-generator v1.4.4
- **Storage**: Browser localStorage for persistence
- **Deployment**: GitHub Pages (static hosting)

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Neeraj Barhate**
- GitHub: [@NeerajBarhate23](https://github.com/NeerajBarhate23)
- Instagram: [@acrylate_23](https://www.instagram.com/acrylate_23)

## 🙏 Acknowledgments

- QR code generation powered by [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
- UI framework by [Alpine.js](https://alpinejs.dev/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Heroicons](https://heroicons.com/)

---

⭐ If this project helped you, please give it a star on GitHub!
