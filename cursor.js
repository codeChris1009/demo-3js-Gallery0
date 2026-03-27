const TITLE_SPARK_COLORS = [
    '#ffffffe6',
    '#fffae6',
    '#fff5c8',
    '#ecdc9d',
];

const INTRO_FIREWORK_COLORS = [
    '#ffffffe6',
    '#fffae6',
    '#fff5c8',
    '#ecdc9d',
    '#ffd48a',
];

const INTRO_SILVER_SPARK_COLORS = [
    '#ffffffe6',
    '#fffae6',
    '#fff5c8',
    '#ecdc9d',
    '#ffd48a',
];

let titleSparkIntervalId = null;
let readySparkIntervalId = null;
let countdownSparkIntervalId = null;

function initIntroCurtainCarousel() {
    return () => {};
}

function createParticle({
    className,
    x,
    y,
    tx,
    ty,
    size = 3,
    color = '#ffffff',
    duration = 800,
    endScale = 0.3,
    boxShadow,
}) {
    const particle = document.createElement('div');
    particle.className = className;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.boxShadow = boxShadow || `0 0 4px ${color}, 0 0 8px ${color}`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--spark-duration', `${duration}ms`);
    particle.style.setProperty('--spark-scale-end', String(endScale));

    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

function createClickSparks(x, y) {
    const sparkCount = 12;
    const ringRadius = 19;

    for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const startX = x + Math.cos(angle) * ringRadius;
        const startY = y + Math.sin(angle) * ringRadius;
        const distance = 10 + Math.random() * 40;

        createParticle({
            className: 'cursor-spark',
            x: startX,
            y: startY,
            tx: Math.cos(angle) * distance,
            ty: Math.sin(angle) * distance,
            size: 3,
            color: 'rgba(255, 255, 255, 1)',
            duration: 600,
            endScale: 0.3,
            boxShadow: [
                '0 0 4px rgba(255, 255, 255, 0.9)',
                '0 0 8px rgba(255, 255, 255, 0.6)',
                '0 0 12px rgba(200, 220, 255, 0.4)',
            ].join(', '),
        });
    }
}

function createTitleSparks(titleElement) {
    if (!titleElement) return;

    const rect = titleElement.getBoundingClientRect();
    const sparkCount = 4;

    for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 12 + Math.random() * 54;
        const color = TITLE_SPARK_COLORS[Math.floor(Math.random() * TITLE_SPARK_COLORS.length)];

        createParticle({
            className: 'title-spark',
            x: rect.left + rect.width * (0.12 + Math.random() * 0.76),
            y: rect.top + rect.height * (0.2 + Math.random() * 0.6),
            tx: Math.cos(angle) * distance,
            ty: Math.sin(angle) * distance,
            size: 3 + Math.random() * 0.6,
            color,
            duration: 2000,
            endScale: 0.2,
            boxShadow: `0 0 4px ${color}, 0 0 9px ${color}`,
        });
    }
}

function createReadySparks(readyElement) {
    if (!readyElement) return;

    const rect = readyElement.getBoundingClientRect();
    const sparkCount = 5;

    for (let i = 0; i < sparkCount; i++) {
        const side = Math.floor(Math.random() * 4);
        let startX = 0;
        let startY = 0;
        let baseAngle = 0;

        if (side === 0) {
            startX = rect.left + Math.random() * rect.width;
            startY = rect.top - 2;
            baseAngle = -Math.PI / 2;
        } else if (side === 1) {
            startX = rect.right + 2;
            startY = rect.top + Math.random() * rect.height;
            baseAngle = 0;
        } else if (side === 2) {
            startX = rect.left + Math.random() * rect.width;
            startY = rect.bottom + 2;
            baseAngle = Math.PI / 2;
        } else {
            startX = rect.left - 2;
            startY = rect.top + Math.random() * rect.height;
            baseAngle = Math.PI;
        }

        const angle = baseAngle + (Math.random() - 0.5) * 1.1;
        const distance = 14 + Math.random() * 66;
        const color = INTRO_FIREWORK_COLORS[Math.floor(Math.random() * INTRO_FIREWORK_COLORS.length)];

        createParticle({
            className: 'title-spark',
            x: startX,
            y: startY,
            tx: Math.cos(angle) * distance,
            ty: Math.sin(angle) * distance,
            size: 3.4 + Math.random() * 0.8,
            color,
            duration: 2000,
            endScale: 0.18,
            boxShadow: `0 0 5px ${color}, 0 0 12px ${color}`,
        });
    }
}

function createCountdownSparks(countdownElement, remainingSeconds) {
    if (!countdownElement) return;

    const rect = countdownElement.getBoundingClientRect();
    const clampedSeconds = Math.max(1, remainingSeconds);
    const intensity = 1 + (8 - clampedSeconds);
    const sparkCount = Math.max(1, 1 + Math.floor(intensity * 0.68));
    const minDistance = (10 + intensity * 4) * 2;
    const maxDistance = (24 + intensity * 16) * 2;
    const minDuration = 700 + intensity * 120;
    const maxDuration = 1100 + intensity * 220;

    for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const startX = rect.left + rect.width * (0.18 + Math.random() * 0.64);
        const startY = rect.top + rect.height * (0.18 + Math.random() * 0.64);
        const distance = minDistance + Math.random() * (maxDistance - minDistance);
        const color = INTRO_FIREWORK_COLORS[Math.floor(Math.random() * INTRO_FIREWORK_COLORS.length)];

        createParticle({
            className: 'intro-firework-spark',
            x: startX,
            y: startY,
            tx: Math.cos(angle) * distance,
            ty: Math.sin(angle) * distance,
            size: 2.4 + intensity * 0.22 + Math.random() * 1.4,
            color,
            duration: minDuration + Math.random() * (maxDuration - minDuration),
            endScale: 0.16,
            boxShadow: `0 0 6px ${color}, 0 0 16px ${color}`,
        });
    }
}

function startCountdownSparks(countdownElement, remainingSeconds) {
    if (!countdownElement) return;

    stopCountdownSparks();
    createCountdownSparks(countdownElement, remainingSeconds);

    const intervalMs = Math.max(70, 240 - (8 - remainingSeconds) * 22);
    countdownSparkIntervalId = window.setInterval(() => {
        createCountdownSparks(countdownElement, remainingSeconds);
    }, intervalMs);
}

function stopCountdownSparks() {
    if (!countdownSparkIntervalId) return;
    window.clearInterval(countdownSparkIntervalId);
    countdownSparkIntervalId = null;
}

function createTextFireworkBurst(element, colors = INTRO_FIREWORK_COLORS) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const sparkCount = 34;

    for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 48 + Math.random() * 220;
        const color = colors[Math.floor(Math.random() * colors.length)];

        createParticle({
            className: 'intro-firework-spark',
            x: rect.left + rect.width * Math.random(),
            y: rect.top + rect.height * Math.random(),
            tx: Math.cos(angle) * distance,
            ty: Math.sin(angle) * distance,
            size: 4 + Math.random() * 4.4,
            color,
            duration: 3000 + Math.random() * 1600,
            endScale: 0.12,
            boxShadow: `0 0 10px ${color}, 0 0 24px ${color}`,
        });
    }
}

function createOuterFrameSparks(frameElement) {
    if (!frameElement) return;

    const rect = frameElement.getBoundingClientRect();
    const sparkCount = 56;

    for (let i = 0; i < sparkCount; i++) {
        const edge = Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;
        let angle = 0;

        if (edge === 0) {
            x = rect.left + Math.random() * rect.width;
            y = rect.top - (6 + Math.random() * 12);
            angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        } else if (edge === 1) {
            x = rect.right + (6 + Math.random() * 12);
            y = rect.top + Math.random() * rect.height;
            angle = (Math.random() - 0.5) * 0.8;
        } else if (edge === 2) {
            x = rect.left + Math.random() * rect.width;
            y = rect.bottom + (6 + Math.random() * 12);
            angle = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        } else {
            x = rect.left - (6 + Math.random() * 12);
            y = rect.top + Math.random() * rect.height;
            angle = Math.PI + (Math.random() - 0.5) * 0.8;
        }

        const distance = 18 + Math.random() * 74;
        const travelDistance = distance * 2;
        const color = INTRO_SILVER_SPARK_COLORS[Math.floor(Math.random() * INTRO_SILVER_SPARK_COLORS.length)];

        createParticle({
            className: 'intro-ring-spark',
            x,
            y,
            tx: Math.cos(angle) * travelDistance,
            ty: Math.sin(angle) * travelDistance,
            size: 6,
            color,
            duration: 1300 + Math.random() * 640,
            endScale: 0.22,
            boxShadow: [
                `0 0 8px ${color}`,
                `0 0 20px ${color}`,
                '0 0 28px rgba(200, 220, 255, 0.35)',
            ].join(', '),
        });
    }
}

function initTitleHoverSparks() {
    const titleElement = document.getElementById('title');
    if (!titleElement) return;

    const stopTitleSparks = () => {
        if (!titleSparkIntervalId) return;
        window.clearInterval(titleSparkIntervalId);
        titleSparkIntervalId = null;
    };

    titleElement.addEventListener('mouseenter', () => {
        stopTitleSparks();
        createTitleSparks(titleElement);
        titleSparkIntervalId = window.setInterval(() => {
            createTitleSparks(titleElement);
        }, 160);
    });

    titleElement.addEventListener('mouseleave', stopTitleSparks);
}

function initReadyHoverSparks() {
    const readyElement = document.getElementById('intro-ready');
    if (!readyElement) return;

    const stopReadySparks = () => {
        if (!readySparkIntervalId) return;
        window.clearInterval(readySparkIntervalId);
        readySparkIntervalId = null;
    };

    readyElement.addEventListener('mouseenter', () => {
        if (readyElement.hidden) return;
        stopReadySparks();
        createReadySparks(readyElement);
        readySparkIntervalId = window.setInterval(() => {
            createReadySparks(readyElement);
        }, 170);
    });

    readyElement.addEventListener('mouseleave', stopReadySparks);
}

function initIntroSequence() {
    const overlay = document.getElementById('intro-overlay');
    const prepLabel = document.getElementById('intro-prep-label');
    const countdown = document.getElementById('intro-countdown');
    const ready = document.getElementById('intro-ready');
    const prompt = document.getElementById('intro-enter-prompt');
    const frame = document.getElementById('intro-frame');

    if (!overlay || !prepLabel || !countdown || !ready || !prompt || !frame) {
        return Promise.resolve();
    }

    document.body.classList.add('intro-active');

    return new Promise((resolve) => {
        const countdownValues = ['8', '7', '6', '5', '4', '3', '2', '1'];
        let currentIndex = 0;
        let isReadyToEnter = false;
        const stopCurtainCarousel = initIntroCurtainCarousel();

        const playCountdownTick = () => {
            const remainingSeconds = Number(countdownValues[currentIndex]);
            countdown.textContent = countdownValues[currentIndex];
            countdown.classList.remove('intro-count-pop');
            void countdown.offsetWidth;
            countdown.classList.add('intro-count-pop');
            startCountdownSparks(countdown, remainingSeconds);

            if (currentIndex === countdownValues.length - 1) {
                window.setTimeout(() => {
                    stopCountdownSparks();
                    prepLabel.classList.add('intro-shatter');
                    countdown.classList.add('intro-shatter');
                    createTextFireworkBurst(countdown);
                    createTextFireworkBurst(prepLabel, INTRO_FIREWORK_COLORS);

                    window.setTimeout(() => {
                        prepLabel.hidden = true;
                        countdown.hidden = true;
                        ready.hidden = false;
                        prompt.hidden = false;
                        overlay.classList.add('is-ready');
                        isReadyToEnter = true;
                    }, 420);
                }, 1400);
                return;
            }

            currentIndex += 1;
            window.setTimeout(playCountdownTick, 1000);
        };

        const enterGallery = () => {
            if (!isReadyToEnter) return;

            isReadyToEnter = false;
            overlay.removeEventListener('click', enterGallery);
            stopCurtainCarousel();
            stopCountdownSparks();
            overlay.classList.add('is-entering');
            document.body.classList.add('gallery-entering');
            createTextFireworkBurst(ready, INTRO_SILVER_SPARK_COLORS);
            createOuterFrameSparks(frame);

            window.setTimeout(() => {
                overlay.style.display = 'none';
                document.body.classList.remove('intro-active');
                document.body.classList.remove('gallery-entering');
                document.body.classList.add('gallery-entered');
                resolve();
            }, 3100);
        };

        overlay.addEventListener('click', enterGallery);
        playCountdownTick();
    });
}

function initCustomCursor() {
    const customCursor = document.getElementById('custom-cursor');

    if (!customCursor) {
        console.warn('Custom cursor element not found');
        return Promise.resolve();
    }

    document.addEventListener('mousemove', (event) => {
        customCursor.style.left = `${event.clientX}px`;
        customCursor.style.top = `${event.clientY}px`;
    });

    document.addEventListener('mousedown', (event) => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        customCursor.style.filter = 'brightness(1.5)';
        createClickSparks(event.clientX, event.clientY);
    });

    document.addEventListener('mouseup', () => {
        customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        customCursor.style.filter = 'brightness(1)';
    });

    document.addEventListener('mouseenter', () => {
        customCursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        customCursor.style.opacity = '0';
    });

    initTitleHoverSparks();
    initReadyHoverSparks();
    return initIntroSequence();
}

export { initCustomCursor };
