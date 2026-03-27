/**
 * 自定義光標管理模塊
 * Custom cursor management module
 */

/**
 * 創建點擊火花效果
 * Create click spark effect
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function createClickSparks(x, y) {
    const sparkCount = 12; // 火花數量（增加以模擬真實火星）
    const ringRadius = 19; // 光圈外環半徑 (2.4em / 2 ≈ 19px)

    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'cursor-spark';

        // 完全隨機的角度（不規則分布）
        const angle = Math.random() * Math.PI * 2;

        // 火花從光圈外環邊緣開始
        const startX = x + Math.cos(angle) * ringRadius;
        const startY = y + Math.sin(angle) * ringRadius;

        // 隨機發散距離（有長有短，10-50px）
        const distance = 10 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        // 設置火花起始位置（在光圈外環上）
        spark.style.left = startX + 'px';
        spark.style.top = startY + 'px';
        spark.style.setProperty('--tx', tx + 'px');
        spark.style.setProperty('--ty', ty + 'px');

        document.body.appendChild(spark);

        // 動畫結束後移除元素
        spark.addEventListener('animationend', () => {
            spark.remove();
        });
    }
}

/**
 * 初始化自定義光標
 * Initialize custom cursor
 */
function initCustomCursor() {
    const customCursor = document.getElementById('custom-cursor');

    if (!customCursor) {
        console.warn('Custom cursor element not found');
        return;
    }

    // 鼠標移動追蹤
    // Mouse move tracking
    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });

    // 點擊時縮放效果和火花效果
    // Scale effect and spark effect on click
    document.addEventListener('mousedown', (e) => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        customCursor.style.filter = 'brightness(1.5)';
        createClickSparks(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', () => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        customCursor.style.filter = 'brightness(1)';
    });

    // 滑鼠進入/離開視窗時顯示/隱藏光標
    // Show/hide cursor when mouse enters/leaves viewport
    document.addEventListener('mouseenter', () => {
        customCursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        customCursor.style.opacity = '0';
    });
}

export { initCustomCursor };
