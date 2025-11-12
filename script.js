// ==================== script.js ====================
// Binaural Beats Pro - Full JavaScript Logic
// English Version | PWA | Firebase Firestore | Offline Ready
// Powered by Mythralux
// =================================================

// === Firebase Config (REPLACE WITH YOURS) ===
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// === Global Variables ===
let audioCtx, leftOsc, rightOsc, masterGain, bgAudio, analyser;
let isPlaying = false;
let timerInterval, totalSeconds;
let canvas, ctx;

// Background sound URLs (free, public domain)
const bgSounds = {
    rain: "https://cdn.pixabay.com/download/audio/2022/05/13/audio_6c22e8f2a6.mp3?filename=rain-107357.mp3",
    ocean: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_46136d8d7e.mp3?filename=ocean-waves-112906.mp3",
    forest: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_671902420c.mp3?filename=forest-sounds-112939.mp3",
    whitenoise: "https://www.soundjay.com/misc/sounds/white-noise-10s.mp3"
};

// Presets
const presets = [
    { name: "Deep Sleep", left: 200, right: 196, beat: 4, desc: "Delta Wave" },
    { name: "Relaxation", left: 432, right: 426, beat: 6, desc: "Theta" },
    { name: "Meditation", left: 528, right: 520, beat: 8, desc: "Alpha" },
    { name: "Focus", left: 440, right: 450, beat: 10, desc: "Beta" },
    { name: "Study Mode", left: 360, right: 380, beat: 20, desc: "Low Gamma" },
    { name: "Lucid Dream", left: 225, right: 232.5, beat: 7.5, desc: "Theta + Gamma" },
    { name: "Anxiety Relief", left: 174, right: 178, beat: 4, desc: "Deep Delta" },
    { name: "Energy Boost", left: 400, right: 420, beat: 20, desc: "High Beta" },
    { name: "Creativity", left: 417, right: 425, beat: 8, desc: "Alpha Flow" },
    { name: "Chakra Balance", left: 432, right: 432, beat: 0, desc: "Monoral 432Hz" }
];

// === DOM Loaded ===
document.addEventListener("DOMContentLoaded", () => {
    setupVisualizer();
    loadPresets();
    loadSavedPresetFromURL();
    loadDynamicContent();
    setupEventListeners();
    updateTimerDisplay();
    registerServiceWorker();
});

// === Service Worker for PWA Offline ===
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('SW Registration Failed:', err));
    }
}

// === Setup Visualizer ===
function setupVisualizer() {
    canvas = document.getElementById("visualizer");
    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// === Load Presets ===
function loadPresets() {
    const container = document.getElementById("presets");
    container.innerHTML = "";
    presets.forEach((p, i) => {
        const btn = document.createElement("div");
        btn.className = "preset-btn";
        btn.innerHTML = `${p.name}<br><small>${p.beat}Hz</small>`;
        btn.onclick = () => {
            setPreset(p);
            document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        };
        container.appendChild(btn);
    });
}

// === Set Preset ===
function setPreset(p) {
    document.getElementById("leftFreq").value = p.left;
    document.getElementById("rightFreq").value = p.right;
    updateFreq();
    stopBinaural();
}

// === Update Frequencies & Beat Display ===
function updateFreq() {
    const l = parseInt(document.getElementById("leftFreq").value);
    const r = parseInt(document.getElementById("rightFreq").value);
    document.getElementById("leftVal").textContent = l;
    document.getElementById("rightVal").textContent = r;
    document.getElementById("beatVal").textContent = Math.abs(l - r);
    if (isPlaying) {
        leftOsc.frequency.setValueAtTime(l, audioCtx.currentTime);
        rightOsc.frequency.setValueAtTime(r, audioCtx.currentTime);
    }
    updateURL();
}

// === Event Listeners ===
function setupEventListeners() {
    document.getElementById("leftFreq").addEventListener("input", updateFreq);
    document.getElementById("rightFreq").addEventListener("input", updateFreq);
    document.getElementById("masterVol").addEventListener("input", updateVolume);
    document.getElementById("bgSound").addEventListener("change", playBackground);
    document.getElementById("timerSlider").addEventListener("input", updateTimerSlider);
    document.getElementById("playBtn").onclick = playBinaural;
    document.getElementById("stopBtn").onclick = stopBinaural;
}

// === Volume Control ===
function updateVolume() {
    const vol = document.getElementById("masterVol").value / 100;
    document.getElementById("volVal").textContent = document.getElementById("masterVol").value;
    if (masterGain) masterGain.gain.value = vol;
}

// === Timer Slider ===
function updateTimerSlider() {
    const mins = document.getElementById("timerSlider").value;
    document.getElementById("timerMin").textContent = mins;
    totalSeconds = mins * 60;
    updateTimerDisplay();
}

// === Play Binaural Beats ===
function playBinaural() {
    if (isPlaying) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    updateVolume();

    const l = parseFloat(document.getElementById("leftFreq").value);
    const r = parseFloat(document.getElementById("rightFreq").value);

    leftOsc = createOscillator(l, -1);
    rightOsc = createOscillator(r, 1);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    masterGain.connect(analyser);

    leftOsc.start();
    rightOsc.start();

    playBackground();
    startTimer();
    animateVisualizer();

    isPlaying = true;
    document.getElementById("playBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;
}

function createOscillator(freq, pan) {
    const osc = audioCtx.createOscillator();
    const panner = audioCtx.createStereoPanner();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    panner.pan.value = pan;
    osc.connect(panner).connect(masterGain);
    return osc;
}

// === Stop & Fade Out ===
function stopBinaural() {
    if (!isPlaying) return;

    // Fade out
    masterGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

    setTimeout(() => {
        leftOsc?.stop();
        rightOsc?.stop();
        if (bgAudio) bgAudio.pause();
        audioCtx?.close();
        clearInterval(timerInterval);
        isPlaying = false;
        document.getElementById("playBtn").disabled = false;
        document.getElementById("stopBtn").disabled = true;
    }, 1600);
}

// === Background Sound ===
function playBackground() {
    if (bgAudio) {
        bgAudio.pause();
        bgAudio = null;
    }
    const sound = document.getElementById("bgSound").value;
    if (!sound || !isPlaying) return;

    bgAudio = new Audio(bgSounds[sound]);
    bgAudio.loop = true;
    bgAudio.volume = 0.3;
    bgAudio.play().catch(() => console.log("Background audio blocked"));
}

// === Timer ===
function startTimer() {
    totalSeconds = document.getElementById("timerSlider").value * 60;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        totalSeconds--;
        updateTimerDisplay();
        if (totalSeconds <= 0) {
            stopBinaural();
            document.getElementById("timer").textContent = "Done!";
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    document.getElementById("timer").textContent = `${m}:${s}`;
}

// === Visualizer Animation ===
function animateVisualizer() {
    if (!isPlaying || !analyser) return;
    requestAnimationFrame(animateVisualizer);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#8b5cf6";
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

// === Save Preset (LocalStorage) ===
function savePreset() {
    const name = prompt("Preset Name:");
    if (!name) return;

    const preset = {
        name,
        left: document.getElementById("leftFreq").value,
        right: document.getElementById("rightFreq").value
    };

    let saved = JSON.parse(localStorage.getItem("customPresets") || "[]");
    saved.push(preset);
    localStorage.setItem("customPresets", JSON.stringify(saved));
    alert("Preset saved locally!");
}

// === Load from URL ===
function loadSavedPresetFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("l") && params.has("r")) {
        document.getElementById("leftFreq").value = params.get("l");
        document.getElementById("rightFreq").value = params.get("r");
        updateFreq();
    }
}

// === Update URL ===
function updateURL() {
    const l = document.getElementById("leftFreq").value;
    const r = document.getElementById("rightFreq").value;
    const url = `${window.location.pathname}?l=${l}&r=${r}`;
    history.replaceState(null, null, url);
}

// === Share Beat ===
function share() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("Link copied! Share this beat.");
    });
}

// === Load Dynamic Content from Firestore ===
function loadDynamicContent() {
    db.collection("announcements").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        let html = "";
        snapshot.forEach(doc => {
            html += `<p style="background:#1e40af;padding:10px;border-radius:8px;margin:10px 0;">${doc.data().text}</p>`;
        });
        document.getElementById("announce-content").innerHTML = html || "<p>No announcements yet.</p>";
    });

    db.collection("ads").orderBy("timestamp", "desc").limit(3).onSnapshot(snapshot => {
        let html = "";
        snapshot.forEach(doc => {
            html += `<div style="background:#164e63;padding:15px;border-radius:10px;margin:10px 0;">${doc.data().text}</div>`;
        });
        document.getElementById("ad-content").innerHTML = html || "<p>No ads.</p>";
    });
}

// === Submit Feedback ===
function submitFeedback() {
    const text = document.getElementById("feedback").value.trim();
    if (!text) return alert("Write something!");

    db.collection("feedback").add({
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent
    }).then(() => {
        alert("Thank you! Feedback sent.");
        document.getElementById("feedback").value = "";
    }).catch(() => alert("Failed. Try again."));
}

// === Hamburger Menu Toggle ===
function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// === Global Share Function (for footer) ===
window.share = share;
window.submitFeedback = submitFeedback;
window.toggleMenu = toggleMenu;

// === Done! Ready for GitHub Pages + Firebase ===
console.log("%c Binaural Beats Pro Loaded | Powered by Mythralux ", "background:#8b5cf6;color:white;padding:10px;border-radius:10px;font-size:16px;");
