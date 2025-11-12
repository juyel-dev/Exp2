// admin-script.js
// Same Firebase config as above
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Login
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password).then(() => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('admin-controls').style.display = 'block';
    }).catch(err => alert('Login failed: ' + err.message));
}

// Logout
function logout() {
    auth.signOut().then(() => location.reload());
}

// Add Announcement
function addAnnouncement() {
    const text = document.getElementById('announce-text').value;
    db.collection('announcements').add({ text, timestamp: new Date() });
    alert('Added!');
}

// Add Ad
function addAd() {
    const text = document.getElementById('ad-text').value;
    db.collection('ads').add({ text, timestamp: new Date() });
    alert('Added!');
}

// Pin Text
function pinText() {
    const text = document.getElementById('pin-text').value;
    db.collection('pins').add({ text, timestamp: new Date() });
    alert('Pinned!');
}

// Add Feature
function addFeature() {
    const text = document.getElementById('feature-text').value;
    db.collection('features').add({ text, timestamp: new Date() });
    alert('Added!');
}

// Auth State
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('admin-controls').style.display = 'block';
    }
});
