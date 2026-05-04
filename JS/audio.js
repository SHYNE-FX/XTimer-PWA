// Audio Elements
const audioElements = {
    work: new Audio('Audio/work.mp3'),
    prepare: new Audio('Audio/prepare.mp3'),
    rest: new Audio('Audio/rest.mp3'),
    readyWork: new Audio('Audio/get ready to work.mp3'),
    readyRest: new Audio('Audio/get ready to rest.mp3'),
    allSetsComplete: new Audio('Audio/all sets completed.mp3')
};

const setAudios = {};
for(let i=1; i<=20; i++) {
    setAudios[i] = new Audio(`Audio/set ${i}, completed.mp3`);
}

// AudioContext for Beep
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(freq = 440, type = 'sine', duration = 0.2) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    oscillator.stop(audioCtx.currentTime + duration);
}

function playAudio(audioObj) {
    if(!audioObj) return;
    audioObj.currentTime = 0;
    audioObj.play().catch(e => console.log('Audio play failed:', e));
}
