// Dark mode initialization - must run before Alpine.js
(function() {
    const storedPreference = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedPreference === 'true' || (!storedPreference && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

// Alpine.js data and methods
function qrApp() {
    return {
        // Current QR editor state
        text: '',
        size: 400,
        errorCorrectionLevel: 'M',
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        backgroundTransparent: false,
        qrName: '',
        
        // QR Collection state
        savedQRs: [],
        currentQRId: null,
        isEditing: false,
        
        // Redirect system state
        actualDestination: '',
        useRedirectSystem: false,
        isGeneratingShortUrl: false,
        
        // UI state
        isDarkMode: false,
        toggleClickCount: 0,
        toggleClickTimer: null,
        showToggleMessage: false,
        showSavedQRs: false,

        initDarkMode() {
            this.isDarkMode = document.documentElement.classList.contains('dark');
            this.loadSavedQRs();
        },
        
        // QR Collection Management
        loadSavedQRs() {
            const saved = localStorage.getItem('savedQRs');
            if (saved) {
                this.savedQRs = JSON.parse(saved);
            }
        },
        
        saveToLocalStorage() {
            localStorage.setItem('savedQRs', JSON.stringify(this.savedQRs));
        },
        
        saveRedirectDestination(qrId, destination) {
            const redirects = JSON.parse(localStorage.getItem('qrRedirects') || '{}');
            redirects[qrId] = destination;
            localStorage.setItem('qrRedirects', JSON.stringify(redirects));
            console.log('Saved redirect destination:', qrId, '→', destination);
            console.log('All redirects:', redirects);
        },
        
        saveShortUrlMapping(qrId, shortUrl, destination) {
            const mappings = JSON.parse(localStorage.getItem('shortUrlMappings') || '{}');
            mappings[qrId] = {
                shortUrl: shortUrl,
                destination: destination,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('shortUrlMappings', JSON.stringify(mappings));
            console.log('Saved short URL mapping:', qrId, '→', shortUrl, '→', destination);
        },
        
        getShortUrlMapping(qrId) {
            const mappings = JSON.parse(localStorage.getItem('shortUrlMappings') || '{}');
            return mappings[qrId];
        },
        
        async updateShortUrlDestination(qrId, newDestination) {
            const mapping = this.getShortUrlMapping(qrId);
            if (mapping && mapping.shortUrl) {
                // For now, we'll create a new short URL since TinyURL doesn't allow updates
                // In a production app, you'd use a service that allows URL updates
                try {
                    let destination = newDestination.trim();
                    if (!destination.match(/^https?:\/\//)) {
                        destination = 'https://' + destination;
                    }
                    
                    const newShortUrl = await this.createShortUrl(destination);
                    this.saveShortUrlMapping(qrId, newShortUrl, destination);
                    
                    // Update the saved QR data
                    const qr = this.savedQRs.find(qr => qr.id === qrId);
                    if (qr) {
                        qr.text = newShortUrl;
                        qr.actualDestination = newDestination;
                        qr.updatedAt = new Date().toISOString();
                        this.saveToLocalStorage();
                    }
                    
                    return newShortUrl;
                } catch (error) {
                    console.error('Error updating short URL:', error);
                    return null;
                }
            }
            return null;
        },
        
        getRedirectDestination(qrId) {
            const redirects = JSON.parse(localStorage.getItem('qrRedirects') || '{}');
            return redirects[qrId] || '';
        },
        
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        saveCurrentQR() {
            if (!this.actualDestination.trim() && !this.text.trim()) {
                alert('Please enter a destination URL or text for the QR code');
                return;
            }
            
            const qrId = this.currentQRId || this.generateId();
            let qrText;
            
            if (this.useRedirectSystem && this.actualDestination.trim()) {
                // Static redirect URL - never changes
                const redirectBaseUrl = 'https://neerajbarhate23.github.io/qrcodegenerator/redirect.html';
                qrText = `${redirectBaseUrl}?id=${qrId}`;
                
                // Save the destination mapping
                this.saveRedirectDestination(qrId, this.actualDestination);
            } else {
                // Direct QR - QR contains the actual text/URL
                qrText = this.text;
            }
            
            const qrData = {
                id: qrId,
                name: this.qrName.trim() || `QR ${this.savedQRs.length + 1}`,
                text: qrText,
                actualDestination: this.actualDestination,
                useRedirectSystem: this.useRedirectSystem,
                size: this.size,
                errorCorrectionLevel: this.errorCorrectionLevel,
                foregroundColor: this.foregroundColor,
                backgroundColor: this.backgroundColor,
                backgroundTransparent: this.backgroundTransparent,
                createdAt: this.currentQRId ? this.savedQRs.find(qr => qr.id === this.currentQRId)?.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (this.currentQRId) {
                // Update existing QR
                const index = this.savedQRs.findIndex(qr => qr.id === this.currentQRId);
                if (index !== -1) {
                    this.savedQRs[index] = qrData;
                }
            } else {
                // Add new QR
                this.savedQRs.unshift(qrData);
                this.currentQRId = qrData.id;
            }
            
            // Regenerate QR to ensure it's up to date
            this.generateQR();
            
            this.isEditing = false;
            this.saveToLocalStorage();
        },
        
        loadQR(qr) {
            this.currentQRId = qr.id;
            this.text = qr.text;
            this.actualDestination = qr.actualDestination || '';
            this.useRedirectSystem = qr.useRedirectSystem || false;
            this.size = qr.size;
            this.errorCorrectionLevel = qr.errorCorrectionLevel;
            this.foregroundColor = qr.foregroundColor;
            this.backgroundColor = qr.backgroundColor;
            this.backgroundTransparent = qr.backgroundTransparent;
            this.qrName = qr.name;
            this.isEditing = true;
            this.generateQR();
        },
        
        createNewQR() {
            this.currentQRId = null;
            this.text = '';
            this.actualDestination = '';
            this.useRedirectSystem = false;
            this.size = 400;
            this.errorCorrectionLevel = 'M';
            this.foregroundColor = '#000000';
            this.backgroundColor = '#ffffff';
            this.backgroundTransparent = false;
            this.qrName = '';
            this.isEditing = false;
            document.getElementById('qrcode').innerHTML = '';
        },
        
        deleteQR(qrId) {
            if (confirm('Are you sure you want to delete this QR code?')) {
                this.savedQRs = this.savedQRs.filter(qr => qr.id !== qrId);
                if (this.currentQRId === qrId) {
                    this.createNewQR();
                }
                this.saveToLocalStorage();
            }
        },
        
        updateRedirectDestination() {
            if (this.currentQRId && this.useRedirectSystem) {
                // Just update the destination mapping - QR stays the same!
                this.saveRedirectDestination(this.currentQRId, this.actualDestination);
                
                // Update the saved QR data
                const qr = this.savedQRs.find(qr => qr.id === this.currentQRId);
                if (qr) {
                    qr.actualDestination = this.actualDestination;
                    qr.updatedAt = new Date().toISOString();
                    this.saveToLocalStorage();
                }
                
                console.log('Updated destination mapping - QR code stays the same!');
            }
        },
        
        duplicateQR(qr) {
            const duplicate = {
                ...qr,
                id: this.generateId(),
                name: `${qr.name} (Copy)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.savedQRs.unshift(duplicate);
            this.saveToLocalStorage();
        },
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            this.applyDarkMode();
            localStorage.setItem('darkMode', this.isDarkMode);

            // Increment click counter
            this.toggleClickCount++;
            
            // Clear existing timer
            if (this.toggleClickTimer) {
                clearTimeout(this.toggleClickTimer);
            }
            
            // Show message if clicked too many times
            if (this.toggleClickCount >= 5) {
                this.showToggleMessage = true;
                setTimeout(() => {
                    this.showToggleMessage = false;
                }, 3000);
                this.toggleClickCount = 0;
            }
            
            // Reset counter after 3 seconds of no clicks
            this.toggleClickTimer = setTimeout(() => {
                this.toggleClickCount = 0;
            }, 3000);
        },
        applyDarkMode() {
            if (this.isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        async generateQR() {
            let qrText;
            
            if (this.useRedirectSystem && this.actualDestination) {
                // For static QR codes, we need a fixed URL structure
                // Your GitHub Pages URL
                const redirectBaseUrl = 'https://neerajbarhate23.github.io/qrcodegenerator/redirect.html';
                
                let qrId = this.currentQRId;
                if (!qrId) {
                    qrId = this.generateId();
                    this.currentQRId = qrId;
                }
                
                // Static URL that never changes
                qrText = `${redirectBaseUrl}?id=${qrId}`;
                
                // Save the destination mapping
                this.saveRedirectDestination(qrId, this.actualDestination);
                
                console.log('Generated STATIC redirect QR:', qrText, 'for destination:', this.actualDestination);
            } else {
                qrText = this.text;
            }
            
            if (!qrText) return;
            
            const qr = qrcode(0, this.errorCorrectionLevel);
            qr.addData(qrText);
            qr.make();
            // Use a fixed module size (e.g., 8) for the preview SVG, independent of the download size selection
            const svgTag = qr.createSvgTag(8); 
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgTag;
            const svg = tempDiv.firstChild;
            const rect = svg.querySelector('rect');
            if (rect) {
                // Use new background states
                rect.setAttribute('fill', this.backgroundTransparent ? 'none' : this.backgroundColor);
            }
            // Apply foreground color to the path
            const path = svg.querySelector('path');
            if (path) {
                path.setAttribute('fill', this.foregroundColor);
            }
            // Ensure SVG scales within the fixed-size container
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            document.getElementById('qrcode').innerHTML = svg.outerHTML;
        },
        downloadPNG() {
            // Regenerate SVG with current settings to ensure color is correct for download
            let qrText;
            
            if (this.useRedirectSystem && this.actualDestination) {
                // Use the static redirect URL
                const redirectBaseUrl = 'https://neerajbarhate23.github.io/qrcodegenerator/redirect.html';
                qrText = `${redirectBaseUrl}?id=${this.currentQRId}`;
            } else {
                qrText = this.text;
            }
            
            if (!qrText) return;
            
            const qr = qrcode(0, this.errorCorrectionLevel);
            qr.addData(qrText);
            qr.make();
            const svgTag = qr.createSvgTag(this.size/25);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgTag;
            const svgElement = tempDiv.firstChild;
            const rect = svgElement.querySelector('rect');
            if (rect) {
                 // Use new background states for download SVG
                rect.setAttribute('fill', this.backgroundTransparent ? 'none' : this.backgroundColor);
            }
            const path = svgElement.querySelector('path');
            if (path) {
                path.setAttribute('fill', this.foregroundColor);
            }
            
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = this.size;
                canvas.height = this.size;
                
                // Use new background states for PNG background fill
                if (!this.backgroundTransparent) {
                    ctx.fillStyle = this.backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'qrcode.png';
                    a.click();
                    URL.revokeObjectURL(url);
                }, 'image/png');
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        },
        downloadSVG() {
            const svg = document.querySelector('#qrcode svg'); 
            const blob = new Blob([svg.outerHTML], {type: 'image/svg+xml'}); 
            const url = URL.createObjectURL(blob); 
            const a = document.createElement('a'); 
            a.href = url; 
            a.download = 'qrcode.svg'; 
            a.click(); 
            URL.revokeObjectURL(url);
        }
    }
}
