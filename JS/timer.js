// Timer State
let timerInterval = null;
let currentTimer = null;
let currentPhaseIndex = 0;
let timeRemaining = 0;
let isPlaying = false;
let phases = []; 

function buildPhases(p) {
    phases = [];
    if (p.prep > 0) phases.push({ type: 'prep', name: 'Prepare', dur: p.prep, set: 1, color: 'var(--prep-color)' }); // [D] Rename
    
    for (let s = 1; s <= p.sets; s++) {
        phases.push({ type: 'work', name: 'Work', dur: p.work, set: s, color: 'var(--work-color)' });
        
        // Add rest after every work phase, including the last set (Final Rest)
        const rDur = (s < p.sets) ? (p.restBetweenSets > 0 ? p.restBetweenSets : p.rest) : p.rest;
        if (rDur > 0) {
            phases.push({ type: 'rest', name: s === p.sets ? 'Final Rest' : 'Rest', dur: rDur, set: s, color: 'var(--rest-color)' });
        }
    }
    
    if (p.cooldown > 0) phases.push({ type: 'cooldown', name: 'Cool Down', dur: p.cooldown, set: p.sets, color: 'var(--prep-color)' });
}

function resetTimer() {
    stopTimer();
    currentPhaseIndex = 0;
    lastPhaseName = '';
    if (phases.length > 0) {
        timeRemaining = phases[0].dur;
        updateTimerUI();
    }
}

function startTimer() {
    if(currentPhaseIndex >= phases.length) return;
    
    if(audioCtx.state === 'suspended') audioCtx.resume();
    Object.values(audioElements).forEach(a => a.load());
    
    if (timeRemaining === phases[currentPhaseIndex].dur) {
        playPhaseAudio(phases[currentPhaseIndex].type, phases[currentPhaseIndex].set);
    }

    isPlaying = true;
    const playBtn = document.getElementById('player-play-btn');
    playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    playBtn.style.backgroundColor = 'rgba(255,255,255,0.2)';
    playBtn.style.color = 'white';

    timerInterval = setInterval(() => {
        timeRemaining--;
        
        const nextPhaseType = currentPhaseIndex + 1 < phases.length ? phases[currentPhaseIndex+1].type : null;

        if (timeRemaining === 8) {
            if (phases[currentPhaseIndex].type === 'rest') {
                const currentSetNum = phases[currentPhaseIndex].set;
                if(setAudios[currentSetNum]) playAudio(setAudios[currentSetNum]);
            }
        }

        if (timeRemaining === 7) {
            if (phases[currentPhaseIndex].type === 'prep') {
                const totalSets = currentTimer.sets;
                const fileName = totalSets === 1 ? '1 set in total.mp3' : `${totalSets} sets in total.mp3`;
                playAudio(new Audio(`Audio/${fileName}`));
            }
        }

        if (timeRemaining === 5) {
            if (nextPhaseType === 'rest') playAudio(audioElements.readyRest);
            if (nextPhaseType === 'work') playAudio(audioElements.readyWork);
        }

        if (timeRemaining > 0 && timeRemaining <= 3) {
            playBeep(600, 'square', 0.1);
        }
        
        if (timeRemaining <= 0) {
            nextPhase();
        } else {
            updateTimerUI();
        }
    }, 1000);
}

function pauseTimer() {
    isPlaying = false;
    const playBtn = document.getElementById('player-play-btn');
    playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>';
    playBtn.style.backgroundColor = 'var(--white)';
    playBtn.style.color = 'var(--black)';
    clearInterval(timerInterval);
}

function stopTimer() {
    isPlaying = false;
    const playBtn = document.getElementById('player-play-btn');
    if (playBtn) {
        playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>';
        playBtn.style.backgroundColor = 'var(--white)';
        playBtn.style.color = 'var(--black)';
    }
    clearInterval(timerInterval);
}

function nextPhase() {
    currentPhaseIndex++;
    if (currentPhaseIndex >= phases.length) {
        playBeep(800, 'square', 1.5);
        playAudio(audioElements.allSetsComplete);
        finishWorkout();
    } else {
        playBeep(800, 'square', 0.5);
        timeRemaining = phases[currentPhaseIndex].dur;
        updateTimerUI();
        playPhaseAudio(phases[currentPhaseIndex].type, phases[currentPhaseIndex].set - (phases[currentPhaseIndex].type === 'rest' ? 1 : 0));
    }
}

function playPhaseAudio(type, setNum) {
    if (type === 'work') playAudio(audioElements.work);
    else if (type === 'prep') playAudio(audioElements.prepare);
    else if (type === 'rest') playAudio(audioElements.rest);
}

function getPhaseHex(type) {
    if (type === 'prep') return state.settings.prepColor || '#AFBEFF';
    if (type === 'work') return state.settings.workColor || '#FF6B6B';
    if (type === 'rest') return state.settings.restColor || '#5669BD';
    return '#5669BD';
}

function adjustColor(hex, percent) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // [K] Logic: 50% Black in dark mode, 50% White in light mode
    if (percent > 0) {
        // Lighten (White)
        r = Math.floor(r + (255 - r) * percent);
        g = Math.floor(g + (255 - g) * percent);
        b = Math.floor(b + (255 - b) * percent);
    } else {
        // Darken (Black)
        r = Math.floor(r * (1 + percent));
        g = Math.floor(g * (1 + percent));
        b = Math.floor(b * (1 + percent));
    }

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

let lastPhaseName = '';

function updateTimerUI() {
    if (currentPhaseIndex >= phases.length) return;
    const phase = phases[currentPhaseIndex];
    
    const playerPhase = document.getElementById('player-phase');
    const playerTime = document.getElementById('player-time');
    const playerProgress = document.getElementById('player-progress');
    const playerView = document.getElementById('player-view');

    // Trigger animation on phase change
    if (lastPhaseName !== phase.name) {
        playerPhase.classList.remove('phase-change-pop');
        void playerPhase.offsetWidth; // Trigger reflow
        playerPhase.classList.add('phase-change-pop');
        
        playerTime.classList.remove('phase-change-pop');
        void playerTime.offsetWidth; // Trigger reflow
        playerTime.classList.add('phase-change-pop');
        
        lastPhaseName = phase.name;
    }

    playerPhase.innerText = phase.name;
    playerPhase.style.color = 'var(--text-app)';
    
    const rawHex = getPhaseHex(phase.type);
    
    // Set background color for smooth transition
    playerView.style.backgroundColor = rawHex;
    
    const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const s = (timeRemaining % 60).toString().padStart(2, '0');
    playerTime.innerText = `${m}:${s}`;
    
    playerProgress.innerText = `Set ${phase.set}/${currentTimer.sets}`;
}

function finishWorkout() {
    stopTimer();
    const playerPhase = document.getElementById('player-phase');
    const playerTime = document.getElementById('player-time');
    const playerProgress = document.getElementById('player-progress');
    const playerView = document.getElementById('player-view');

    playerPhase.innerText = 'Workout Complete!';
    playerView.style.backgroundColor = 'var(--bg-app)';
    playerTime.innerText = '00:00';
    playerProgress.innerText = '';
    
    const duration = phases.reduce((acc, p) => acc + p.dur, 0);
    const now = new Date();
    
    state.records.push({
        id: Date.now().toString(),
        presetId: currentTimer.id,
        presetName: currentTimer.name,
        timestamp: now.getTime(),
        duration: duration,
        completed: true
    });
    
    saveData();
    if(state.activeView === 'dashboard') {
        renderView(state.activeView);
    }
}
