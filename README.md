# EasOfTopia Landing Page

A modern, responsive landing page serving as the central hub for EasOfTopia's creative tools ecosystem. Built with enterprise-grade architecture, featuring seamless navigation between TopiaStyler (visual editor) and Paletteniffer (color utility) with advanced PWA capabilities, dark mode support, and accessibility compliance.

## 🚀 Features

- **Progressive Web App (PWA)**: Installable with offline capabilities
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG 2.1 AA compliant with ARIA attributes
- **Performance**: Optimized assets, lazy loading, and smooth animations
- **Cross-domain Theme Persistence**: Seamless theme switching between services
- **Contact Form**: Integrated Web3Forms with real-time validation
- **SEO Optimized**: Meta tags, structured data, and social media cards

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Tailwind CSS CDN
- **Animations**: CSS3 Transitions, Transforms, and Keyframes
- **Forms**: Web3Forms API integration
- **Icons**: SVG inline icons for optimal performance
- **Fonts**: Google Fonts (Inter) with font-display: swap

## 📁 Project Structure

```
easoftopia-landing/
├── index.html              # Main HTML document
├── style.css               # Custom styles and animations
├── script.js               # Core functionality and routing
├── contact-form.js         # Contact form logic
├── manifest.json           # PWA manifest
├── README.md              # Project documentation
└── assets/                # Static assets
    ├── logo_landing.png   # Main logo
    ├── logo_EasOfTopia.png # TopiaStyler logo
    └── logo_paletniffer.png # Paletteniffer logo
```

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/easoftopia-landing.git
   cd easoftopia-landing
   ```

2. **Configure Service URLs:**
   Update the `platformApps` array in `script.js`:
   ```javascript
   const platformApps = [
     { name: 'TopiaStyler', key: 'visualEditor', url: 'YOUR_TOPIASTYLER_URL' },
     { name: 'Paletteniffer', key: 'paletteniffer', url: 'YOUR_PALETTENIFFER_URL' }
   ];
   ```

3. **Deploy:**
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag and drop the folder
   - **GitHub Pages**: Enable in repository settings

## 🔧 Configuration

### Service URLs
Edit the `platformApps` array in `script.js` to point to your deployed services.

### Contact Form
The contact form uses Web3Forms. Update the access key in `contact-form.js`:
```javascript
const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
accessKeyInput.value = 'YOUR_WEB3FORMS_ACCESS_KEY';
```

### PWA Settings
Customize the PWA manifest in `manifest.json`:
- App name and description
- Theme colors
- Icon sizes and purposes
- Shortcuts configuration

## 🎨 Customization

### Colors and Themes
The color scheme is defined in CSS custom properties. Key color variables:
- Primary: `#7c3aed` (Violet)
- Secondary: `#f472b6` (Pink)
- Background gradients and accent colors

### Animations
Custom animations are defined in `style.css`:
- `logo-pop-in`: Logo entrance animation
- `gradient-shimmer`: Hero title gradient animation
- `fade-in-down/up`: Scroll-triggered animations

## 📱 PWA Features

- **Installable**: Add to home screen on supported devices
- **Offline Support**: Service worker caching (configurable)
- **App Shortcuts**: Quick access to individual services
- **Theme Integration**: Respects system dark/light mode

## 🔍 Performance Optimizations

- **Image Optimization**: WebP format with fallbacks
- **Font Loading**: Google Fonts with display: swap
- **CSS Optimization**: Critical CSS inlined, non-critical deferred
- **JavaScript**: Modular loading, event delegation
- **Caching**: Browser caching headers, asset versioning

## 🧪 Testing

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility Testing
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard navigation
- Color contrast compliance
- Focus management

## 📈 Analytics & Monitoring

Recommended integrations:
- Google Analytics 4
- Google Search Console
- Core Web Vitals monitoring
- Error tracking (Sentry)

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
1. Connect your GitHub repository
2. Set build command: `echo "Static site"`
3. Set publish directory: `.`

### GitHub Pages
1. Enable Pages in repository settings
2. Select source branch
3. Configure custom domain (optional)

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact via the integrated contact form
- Email: support@easoftopia.com

---

**Built with ❤️ by the EasOfTopia team**
