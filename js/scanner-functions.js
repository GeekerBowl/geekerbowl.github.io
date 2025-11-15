let scanStream = null;
let scanVideoElement = null;
let isScanning = false;
let scanInterval = null;

function initScanner() {
    createScanModal();
}

function createScanModal() {
    const modalHTML = `
        <div id="scan-modal" class="scan-modal">
            <div class="scan-modal-content">
                <div class="scan-modal-header">
                    <h2 class="scan-modal-title">
                        <i class="fas fa-camera"></i>
                        扫描卡片
                    </h2>
                    <button class="scan-modal-close" onclick="closeScanModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="scan-tips">
                    <div class="scan-tips-title">
                        <i class="fas fa-info-circle"></i>
                        扫描提示
                    </div>
                    <ul class="scan-tips-list">
                        <li>将卡片平放在摄像头前</li>
                        <li>确保ACCESS CODE区域清晰可见</li>
                        <li>保持卡片稳定，系统会自动识别</li>
                    </ul>
                </div>
                
                <div class="scan-status scanning" id="scan-status">
                    <i class="fas fa-spinner fa-spin"></i> 准备摄像头...
                </div>
                
                <div class="scan-video-container">
                    <video id="scan-video" autoplay playsinline></video>
                    <div class="scan-overlay">
                        <div class="scan-frame">
                            <div class="scan-line"></div>
                            <div class="scan-frame-corner-bl"></div>
                            <div class="scan-frame-corner-br"></div>
                        </div>
                    </div>
                </div>
                
                <div class="scan-result" id="scan-result" style="display: none;">
                    <div class="scan-result-label">识别到的卡号:</div>
                    <div class="scan-result-text" id="scan-result-text">-</div>
                </div>
                
                <div class="scan-actions">
                    <button class="scan-action-btn secondary" onclick="closeScanModal()">取消</button>
                    <button class="scan-action-btn primary" id="confirm-scan-btn" onclick="confirmScanResult()" disabled>
                        确认使用
                    </button>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('scan-modal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function openScanModal() {
    const modal = document.getElementById('scan-modal');
    if (!modal) {
        createScanModal();
    }
    
    modal.classList.add('active');
    scanVideoElement = document.getElementById('scan-video');
    
    try {
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };
        
        scanStream = await navigator.mediaDevices.getUserMedia(constraints);
        scanVideoElement.srcObject = scanStream;
        scanVideoElement.onloadedmetadata = () => {
            updateScanStatus('scanning', '将卡片对准扫描框，正在识别中...');
            startAutoScanning();
        };
        
    } catch (error) {
        console.error('无法访问摄像头:', error);
        updateScanStatus('error', '无法访问摄像头，请检查权限设置');
    }
}

function closeScanModal() {
    const modal = document.getElementById('scan-modal');
    modal.classList.remove('active');

    stopAutoScanning();

    if (scanStream) {
        scanStream.getTracks().forEach(track => track.stop());
        scanStream = null;
    }

    isScanning = false;
    const resultDiv = document.getElementById('scan-result');
    if (resultDiv) {
        resultDiv.style.display = 'none';
    }
}

function startAutoScanning() {
    if (isScanning) return;
    
    isScanning = true;

    scanInterval = setInterval(() => {
        captureAndRecognize();
    }, 1000);
}

function stopAutoScanning() {
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    isScanning = false;
}

async function captureAndRecognize() {
    if (!scanVideoElement || !isScanning) return;
    
    try {
        const canvas = document.createElement('canvas');
        canvas.width = scanVideoElement.videoWidth;
        canvas.height = scanVideoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(scanVideoElement, 0, 0);
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const { data: { text } } = await Tesseract.recognize(
                blob,
                'eng',
                {
                    logger: () => {}
                }
            );

            const numbers = extractAccessCode(text);
            
            if (numbers) {
                stopAutoScanning();
                updateScanStatus('success', '识别成功！');
                displayScanResult(numbers);
            }
        }, 'image/png');
        
    } catch (error) {
        console.error('识别失败:', error);
    }
}

function extractAccessCode(text) {
    const cleaned = text.replace(/[\s\n\r]/g, '');
    const patterns = [
        /(\d{20})/,
        /(\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4})/,
        /(\d{5}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{3})/
    ];
    
    for (const pattern of patterns) {
        const match = cleaned.match(pattern);
        if (match) {
            const numbers = match[1].replace(/\D/g, '');
            if (numbers.length === 20) {
                return numbers;
            }
        }
    }

    const allDigits = text.replace(/\D/g, '');

    if (allDigits.length >= 20) {
        for (let i = 0; i <= allDigits.length - 20; i++) {
            const candidate = allDigits.substr(i, 20);
            if (!/^(\d)\1{19}$/.test(candidate)) {
                return candidate;
            }
        }
    }
    
    return null;
}

function updateScanStatus(type, message) {
    const statusDiv = document.getElementById('scan-status');
    if (!statusDiv) return;
    
    statusDiv.className = `scan-status ${type}`;
    
    let icon = '<i class="fas fa-spinner fa-spin"></i>';
    if (type === 'success') {
        icon = '<i class="fas fa-check-circle"></i>';
    } else if (type === 'error') {
        icon = '<i class="fas fa-exclamation-circle"></i>';
    }
    
    statusDiv.innerHTML = `${icon} ${message}`;
}

function displayScanResult(accessCode) {
    const resultDiv = document.getElementById('scan-result');
    const resultText = document.getElementById('scan-result-text');
    const confirmBtn = document.getElementById('confirm-scan-btn');
    
    if (resultDiv && resultText) {
        resultDiv.style.display = 'block';
        resultText.textContent = accessCode;

        const formatted = accessCode.match(/.{1,4}/g).join(' ');
        resultText.textContent = formatted;

        window.scannedAccessCode = accessCode;

        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }
}

function confirmScanResult() {
    if (window.scannedAccessCode) {
        const guidInput = document.getElementById('guid-input');
        if (guidInput) {
            guidInput.value = window.scannedAccessCode;

            guidInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        closeScanModal();

        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('卡号已自动填入');
        }
    }
}

window.openScanModal = openScanModal;
window.closeScanModal = closeScanModal;
window.confirmScanResult = confirmScanResult;
