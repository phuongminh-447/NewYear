// Fireworks animation
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];
let canvas;
let ctx;
let userName = '';
let audioContext;
let musicPlayer;
let wishesData = {};

function initCanvas() {
    const fireworksDiv = document.getElementById('fireworks');
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    fireworksDiv.appendChild(canvas);
    ctx = canvas.getContext('2d');

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Get music player element
    musicPlayer = document.getElementById('musicPlayer');
}

function loadWishes() {
    // Load wishes from JSON file
    fetch('wishes.json')
        .then(response => response.json())
        .then(data => {
            wishesData = data.wishes;
            console.log('Wishes loaded successfully');
            displayWishes();
        })
        .catch(err => {
            console.log('Could not load wishes.json:', err);
            // Use default wishes if file not found
            wishesData = {
                default: [
                    'Chúc bạn một năm mới đầy sắc màu!',
                    'Năm mới, may mắn mới!',
                    'Sức khỏe, hạnh phúc là điều tôi chúc cho bạn!'
                ]
            };
            displayWishes();
        });
}

function getRandomWish(name) {
    // Get wish based on name, or return random default wish
    const wishes = wishesData[name] || wishesData.default || [];
    if (wishes.length === 0) return `Chúc mừng bạn ${name}!`;
    return wishes[Math.floor(Math.random() * wishes.length)];
}

function displayWishes(name = null) {
    // Display wishes based on name, or random default wishes
    const wishesContainer = document.getElementById('wishesContainer');
    if (!wishesContainer || !wishesData.default) return;
    
    // Choose wishes based on name
    let wishesList = wishesData.default;
    
    if (name && wishesData[name]) {
        // If name has specific wishes, use them
        wishesList = wishesData[name];
    }
    
    const selectedWishes = [];
    const limit = Math.min(3, wishesList.length);
    
    // Get random wishes without repetition
    const indices = [];
    while (indices.length < limit) {
        const idx = Math.floor(Math.random() * wishesList.length);
        if (!indices.includes(idx)) {
            indices.push(idx);
            selectedWishes.push(wishesList[idx]);
        }
    }
    
    // Clear container and add wishes
    wishesContainer.innerHTML = '';
    selectedWishes.forEach(wish => {
        const p = document.createElement('p');
        p.textContent = '✨ ' + wish;
        wishesContainer.appendChild(p);
    });
}

function createFireworks(x, y, count = 40) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);

        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    if (particles.length > 0) {
        requestAnimationFrame(animate);
    }
}

function celebrate() {
    // Multiple fireworks at different positions
    const positions = [
        { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 },
        { x: window.innerWidth * 0.8, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.3, y: window.innerHeight * 0.5 },
        { x: window.innerWidth * 0.7, y: window.innerHeight * 0.45 },
    ];

    positions.forEach(pos => {
        createFireworks(pos.x, pos.y, 50);
    });

    animate();
}

function autoFireworks() {
    // Auto trigger fireworks in sequence
    const positions = [
        { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 },
        { x: window.innerWidth * 0.8, y: window.innerHeight * 0.3 },
        { x: window.innerWidth * 0.3, y: window.innerHeight * 0.5 },
        { x: window.innerWidth * 0.7, y: window.innerHeight * 0.45 },
    ];

    let index = 0;
    const interval = setInterval(() => {
        if (index < positions.length) {
            const pos = positions[index];
            createFireworks(pos.x, pos.y, 60);
            animate();
            index++;
        } else {
            clearInterval(interval);
        }
    }, 400);
}

function playSound() {
    // Create a simple beep sound using Web Audio API
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        const now = audioContext.currentTime;
        
        for (let i = 0; i < 5; i++) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.setValueAtTime(800 + i * 200, now + i * 0.1);
            gain.gain.setValueAtTime(0.3, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.1);
        }
    } catch (e) {
        // Audio context not available, skip
    }
}

function playNewYearSong() {
    // Play a melodic celebration song
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        const now = audioContext.currentTime;
        
        // Happy melody notes - "Happy New Year" theme
        const notes = [
            { freq: 523.25, duration: 0.5 },  // C5
            { freq: 523.25, duration: 0.5 },  // C5
            { freq: 587.33, duration: 0.5 },  // D5
            { freq: 523.25, duration: 0.5 },  // C5
            { freq: 659.25, duration: 0.5 },  // E5
            { freq: 783.99, duration: 1.0 },  // G5
            { freq: 523.25, duration: 0.5 },  // C5
            { freq: 523.25, duration: 0.5 },  // C5
            { freq: 587.33, duration: 0.5 },  // D5
            { freq: 523.25, duration: 0.5 },  // C5
            { freq: 659.25, duration: 0.5 },  // E5
            { freq: 783.99, duration: 1.5 },  // G5
        ];
        
        let currentTime = now;
        notes.forEach((note) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.freq, currentTime);
            gain.gain.setValueAtTime(0.2, currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
            
            osc.start(currentTime);
            osc.stop(currentTime + note.duration);
            
            currentTime += note.duration + 0.1;
        });
    } catch (e) {
        console.log('Audio playback not available');
    }
}

function submitName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (name === '') {
        alert('Vui lòng nhập tên của bạn!');
        return;
    }
    
    userName = name;
    
    // Hide modal and show main page
    document.getElementById('nameModal').style.display = 'none';
    document.getElementById('mainPage').style.display = 'flex';
    
    // Set greeting with random default wish
    const wish = getRandomWish('default');
    document.getElementById('greeting').textContent = wish;
    
    // Display wishes based on user's name
    displayWishes(userName);
    
    // Play music from local file
    if (musicPlayer) {
        musicPlayer.play().catch(err => {
            console.log('Could not play music:', err);
            // Fallback: play beep sound if file not found
            playNewYearSong();
        });
    }
    
    // Auto trigger fireworks after a short delay
    setTimeout(() => {
        autoFireworks();
    }, 1000);
}

// Initialize canvas on page load
window.addEventListener('load', () => {
    initCanvas();
    loadWishes();
    
    // Focus on name input
    document.getElementById('nameInput').focus();
    
    // Allow Enter key to submit
    document.getElementById('nameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitName();
        }
    });
});

// Allow clicking on the page to trigger fireworks on main page
document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && document.getElementById('mainPage').style.display !== 'none') {
        createFireworks(e.clientX, e.clientY, 30);
        animate();
    }
});
