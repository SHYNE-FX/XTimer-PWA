// App Initialization
function init() {
    loadData();
    
    // Global Event Listeners
    els.navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.dataset.view) return;
            els.formView.classList.add('hidden');
            els.playerView.classList.add('hidden');
            stopTimer();
            if(state.activeView !== btn.dataset.view) {
                renderView(btn.dataset.view);
            }
        });
    });

    els.addBtn.addEventListener('click', () => openForm());
    
    els.closeFormBtn.addEventListener('click', () => {
        els.formView.classList.add('hidden');
    });

    els.saveFormBtn.addEventListener('click', () => {
        const name = document.getElementById('preset-name').value.trim() || 'Timer';
        const prep = parseInt(document.getElementById('preset-prep').value) || 0;
        const work = parseInt(document.getElementById('preset-work').value) || 1;
        const rest = parseInt(document.getElementById('preset-rest').value) || 0;
        const sets = parseInt(document.getElementById('preset-sets').value) || 1;
        const restBetweenSets = parseInt(document.getElementById('preset-rest-sets').value) || 0;
        const cooldown = parseInt(document.getElementById('preset-cooldown').value) || 0;

        const presetData = {
            id: editingPresetId || Date.now().toString(),
            name, prep, work, rest, sets, restBetweenSets, cooldown
        };

        if (editingPresetId) {
            const idx = state.presets.findIndex(p => p.id === editingPresetId);
            state.presets[idx] = presetData;
        } else {
            state.presets.push(presetData);
        }

        saveData();
        els.formView.classList.add('hidden');
        renderView('presets');
    });

    els.deletePresetBtn.addEventListener('click', () => {
        if (confirm('Delete this timer?')) {
            state.presets = state.presets.filter(p => p.id !== editingPresetId);
            saveData();
            els.formView.classList.add('hidden');
            renderView('presets');
        }
    });

    els.closePlayerBtn.addEventListener('click', () => {
        stopTimer();
        els.playerView.classList.add('hidden');
        document.getElementById('bottom-nav').classList.remove('nav-hidden'); // Show nav when player closes
    });

    els.playerPlayBtn.addEventListener('click', () => {
        if (isPlaying) pauseTimer();
        else startTimer();
    });

    els.playerResetBtn.addEventListener('click', resetTimer);

    els.playerNextBtn.addEventListener('click', () => {
        if (currentPhaseIndex < phases.length - 1) {
            currentPhaseIndex++;
            timeRemaining = phases[currentPhaseIndex].dur;
            updateTimerUI();
            if(isPlaying) playPhaseAudio(phases[currentPhaseIndex].type, phases[currentPhaseIndex].set);
        } else {
            finishWorkout();
        }
    });

    els.playerPrevBtn.addEventListener('click', () => {
        if (currentPhaseIndex > 0) {
            currentPhaseIndex--;
            timeRemaining = phases[currentPhaseIndex].dur;
            updateTimerUI();
            if(isPlaying) playPhaseAudio(phases[currentPhaseIndex].type, phases[currentPhaseIndex].set);
        } else {
            timeRemaining = phases[currentPhaseIndex].dur;
            updateTimerUI();
        }
    });

    renderView('presets');
    els.mainContent.style.transition = 'opacity 0.15s ease-in-out';
}

// Initial call
document.addEventListener('DOMContentLoaded', init);
