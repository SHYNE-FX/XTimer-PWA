const els = {
    mainContent: document.getElementById('main-content'),
    headerTitle: document.getElementById('header-title'),
    addBtn: document.getElementById('add-btn'),
    navItems: document.querySelectorAll('.nav-item'),
    formView: document.getElementById('form-view'),
    playerView: document.getElementById('player-view'),
    closeFormBtn: document.getElementById('close-form-btn'),
    saveFormBtn: document.getElementById('save-form-btn'),
    deletePresetBtn: document.getElementById('delete-preset-btn'),
    closePlayerBtn: document.getElementById('close-player-btn'),
    playerPlayBtn: document.getElementById('player-play-btn'),
    playerResetBtn: document.getElementById('player-reset-btn'),
    playerPrevBtn: document.getElementById('player-prev-btn'),
    playerNextBtn: document.getElementById('player-next-btn'),
    playerTitle: document.getElementById('player-title')
};

// Views Setup
const views = {
    presets: {
        title: 'Home',
        render: () => {
            if (state.presets.length === 0) {
                return `<div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <p>No timers found.<br>Create a new timer to get started.</p>
                </div>`;
            }
            let html = '<div id="preset-list">';
            state.presets.forEach((p, index) => {
                const totalDur = (p.prep) + (p.sets * (p.work + p.rest)) + ((p.sets - 1) * p.restBetweenSets) + p.cooldown; 
                const mins = Math.floor(totalDur / 60);
                const secs = totalDur % 60;
                html += `
                    <div class="card preset-card" data-index="${index}" style="cursor: grab;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                            <div style="flex:1;">
                                <h3 class="card-title">${p.name}</h3>
                                <p class="card-subtitle">${p.sets} Sets</p>
                            </div>
                            <div style="display:flex; gap:6px;">
                                <button class="ghost-btn" onclick="editPreset(event, '${p.id}')" style="color:var(--text-card); background:rgba(128,128,128,0.1); width:36px; height:36px; padding:0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                                </button>
                                <button class="ghost-btn" onclick="duplicatePresetDirect(event, '${p.id}')" style="color:var(--text-card); background:rgba(128,128,128,0.1); width:36px; height:36px; padding:0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                                <button class="ghost-btn" onclick="deletePresetDirect(event, '${p.id}')" style="color:var(--text-card); background:rgba(128,128,128,0.1); width:36px; height:36px; padding:0;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                                <button class="primary-btn" onclick="openTimerDirect(event, '${p.id}')" style="background:var(--accent-color, #FF4B4B); color:white; height:36px; padding:0 12px; display:flex; align-items:center; justify-content:center; border-radius:18px; gap:4px; font-weight:bold; font-size:12px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg> START
                                </button>
                            </div>
                        </div>
                        <div class="card-details">
                            <span class="card-badge">Work: ${p.work}s | Rest: ${p.rest}s</span>
                            <span>~${mins}m ${secs}s</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            return html;
        }
    },
    dashboard: {
        title: 'Stats', // [I] Rename
        render: () => {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const past45Mins = now.getTime() - (45 * 60 * 1000);

            const allTimeWorkouts = state.records.length;
            const allTimeSecs = state.records.reduce((acc, r) => acc + r.duration, 0);

            let todayWorkouts = 0;
            let todaySecs = 0;
            let nowWorkouts = 0;
            let nowSecs = 0;

            state.records.forEach(r => {
                const recTime = new Date(r.timestamp).getTime();
                if (recTime >= todayStart) {
                    todayWorkouts++;
                    todaySecs += r.duration;
                }
                if (recTime >= past45Mins) {
                    nowWorkouts++;
                    nowSecs += r.duration;
                }
            });

            const formatTime = (secs) => {
                const h = Math.floor(secs / 3600);
                const m = Math.floor((secs % 3600) / 60);
                return `${h}h <span style="font-size:24px">${m}m</span>`;
            };

            return `
                <div style="display:flex; flex-direction:column; gap:24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:0 4px;">
                        <h2 style="font-size:18px; font-weight:600;">Overview</h2>
                        <button class="secondary-btn" onclick="openClearStatsModal()" style="height:32px; font-size:12px; padding:0 12px; border-radius:8px;">Clear</button>
                    </div>
                    <div>
                        <h2 style="font-size:14px; margin-bottom:12px; font-weight:600; opacity:0.6; padding-left:4px;">Past 45m</h2>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div class="card" style="padding:20px 16px; text-align:center; margin-bottom:0;">
                                <h3 style="font-size:32px; font-weight:700; color:var(--sky-blue); margin-bottom:4px;">${nowWorkouts}</h3>
                                <p style="font-size:13px; color:#888;">Workouts</p>
                            </div>
                            <div class="card" style="padding:20px 16px; text-align:center; margin-bottom:0;">
                                <h3 style="font-size:32px; font-weight:700; color:var(--sky-blue); margin-bottom:4px;">${formatTime(nowSecs)}</h3>
                                <p style="font-size:13px; color:#888;">Total Time</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 style="font-size:14px; margin-bottom:12px; font-weight:600; opacity:0.6; padding-left:4px;">Today</h2>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div class="card" style="padding:20px 16px; text-align:center; margin-bottom:0;">
                                <h3 style="font-size:32px; font-weight:700; color:var(--sky-blue); margin-bottom:4px;">${todayWorkouts}</h3>
                                <p style="font-size:13px; color:#888;">Workouts</p>
                            </div>
                            <div class="card" style="padding:20px 16px; text-align:center; margin-bottom:0;">
                                <h3 style="font-size:32px; font-weight:700; color:var(--sky-blue); margin-bottom:4px;">${formatTime(todaySecs)}</h3>
                                <p style="font-size:13px; color:#888;">Total Time</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 style="font-size:14px; margin-bottom:12px; font-weight:600; opacity:0.6; padding-left:4px;">All Time</h2>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                            <div class="card" style="padding:20px 16px; text-align:center; margin-bottom:0;">
                                <h3 style="font-size:32px; font-weight:700; color:var(--sky-blue); margin-bottom:4px;">${allTimeWorkouts}</h3>
                                <p style="font-size:13px; color:#888;">Workouts</p>
                            </div>
                            <div class="card" style="padding:20px 16px; text-align:center; margin-bottom:0;">
                                <h3 style="font-size:32px; font-weight:700; color:var(--sky-blue); margin-bottom:4px;">${formatTime(allTimeSecs)}</h3>
                                <p style="font-size:13px; color:#888;">Total Time</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    settings: {
        title: 'Settings',
        render: () => {
            return `
                <div style="display:flex; flex-direction:column; gap:24px;">
                    <div class="card" style="margin-bottom:0;">
                        <h3 class="card-title" style="margin-bottom:16px;">Appearance</h3>
                        
                        <div class="input-group">
                            <label>Theme</label>
                            <select id="setting-theme" onchange="updateSettings('theme', this.value)">
                                <option value="dark" ${state.settings.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                                <option value="light" ${state.settings.theme === 'light' ? 'selected' : ''}>Light Mode</option>
                            </select>
                        </div>

                        <div style="display: flex; justify-content: center; gap: 48px; margin-top: 8px; margin-bottom: 24px;">
                            <div class="input-group" style="align-items: center; margin-bottom: 0;">
                                <label style="margin-bottom: 8px;">Main Color</label>
                                <div class="color-circle">
                                    <input type="color" value="${state.settings.mainColor}" onchange="updateSettings('mainColor', this.value)">
                                    <div class="color-circle-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div class="input-group" style="align-items: center; margin-bottom: 0;">
                                <label style="margin-bottom: 8px;">Accent Color</label>
                                <div class="color-circle">
                                    <input type="color" value="${state.settings.accentColor || '#FF4B4B'}" onchange="updateSettings('accentColor', this.value)">
                                    <div class="color-circle-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="settings-grid-3" style="margin-top:16px;">
                            <div class="input-group">
                                <label style="font-size:12px; text-align:center;">Prepare Color</label>
                                <div class="color-picker-container">
                                    <div class="color-circle">
                                        <input type="color" value="${state.settings.prepColor || '#AFBEFF'}" onchange="updateSettings('prepColor', this.value)">
                                        <div class="color-circle-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="input-group">
                                <label style="font-size:12px; text-align:center;">Work Color</label>
                                <div class="color-picker-container">
                                    <div class="color-circle">
                                        <input type="color" value="${state.settings.workColor || '#FF6B6B'}" onchange="updateSettings('workColor', this.value)">
                                        <div class="color-circle-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg></div>
                                    </div>
                                </div>
                            </div>
                            <div class="input-group">
                                <label style="font-size:12px; text-align:center;">Rest Color</label>
                                <div class="color-picker-container">
                                    <div class="color-circle">
                                        <input type="color" value="${state.settings.restColor || '#5669BD'}" onchange="updateSettings('restColor', this.value)">
                                        <div class="color-circle-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom:0;">
                        <h3 class="card-title" style="margin-bottom:16px;">Typography</h3>
                        
                        <div class="input-group">
                            <label>Font Size</label>
                            <select id="setting-fontsize" onchange="updateSettings('fontSize', this.value)">
                                <option value="small" ${state.settings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                                <option value="medium" ${state.settings.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="large" ${state.settings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label>Font Style</label>
                            <select id="setting-fontfamily" onchange="updateSettings('fontFamily', this.value)">
                                <option value="instrument" ${(!state.settings.fontFamily || state.settings.fontFamily === 'instrument') ? 'selected' : ''}>Instrument Sans</option>
                                <option value="syne" ${state.settings.fontFamily === 'syne' ? 'selected' : ''}>Syne</option>
                                <option value="poppins" ${state.settings.fontFamily === 'poppins' ? 'selected' : ''}>Poppins</option>
                                <option value="playfair" ${state.settings.fontFamily === 'playfair' ? 'selected' : ''}>Playfair Display</option>
                                <option value="comfortaa" ${state.settings.fontFamily === 'comfortaa' ? 'selected' : ''}>Comfortaa</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="text-align:center; padding:16px; color:#888; font-size:14px;">
                        Version ${state.version}
                    </div>
                </div>
            `;
        }
    }
};

window.updateSettings = function(key, value) {
    state.settings[key] = value;
    saveData();
    applySettings();
    renderView('settings');
}

function renderView(viewName) {
    els.mainContent.style.opacity = '0';
    
    setTimeout(() => {
        els.mainContent.innerHTML = views[viewName].render();
        els.headerTitle.innerText = views[viewName].title;
        state.activeView = viewName;
        
        els.navItems.forEach(btn => {
            if (btn.id === 'add-btn') return;
            if(btn.dataset.view === viewName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        els.mainContent.style.opacity = '1';
        
        if (viewName === 'presets' && window.Sortable) {
            const listEl = document.getElementById('preset-list');
            if (listEl) {
                new Sortable(listEl, {
                    animation: 150,
                    delay: 200,
                    delayOnTouchOnly: true,
                    ghostClass: 'sortable-ghost',
                    onEnd: function (evt) {
                        if (evt.oldIndex !== evt.newIndex) {
                            const item = state.presets.splice(evt.oldIndex, 1)[0];
                            state.presets.splice(evt.newIndex, 0, item);
                            saveData();
                            renderView('presets');
                        }
                    }
                });
            }
        }
    }, 150);
}

// Stats Clear Logic [H]
function openClearStatsModal() {
    document.getElementById('stats-clear-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function closeClearStatsModal() {
    document.getElementById('stats-clear-modal').classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
}

function clearStats(type) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (type === 'now') {
        const past45Mins = now.getTime() - (45 * 60 * 1000);
        state.records = state.records.filter(r => new Date(r.timestamp).getTime() < past45Mins);
    } else if (type === 'today') {
        state.records = state.records.filter(r => new Date(r.timestamp).getTime() < todayStart);
    } else if (type === 'all') {
        state.records = [];
    }
    
    saveData();
    closeClearStatsModal();
    renderView('dashboard');
}

// Form Management
let editingPresetId = null;

function openForm(presetId = null) {
    editingPresetId = presetId;
    if (presetId) {
        els.formView.querySelector('#form-title').innerText = 'Edit Timer';
        const p = state.presets.find(x => x.id === presetId);
        document.getElementById('preset-name').value = p.name;
        document.getElementById('preset-prep').value = p.prep;
        document.getElementById('preset-work').value = p.work;
        document.getElementById('preset-rest').value = p.rest;
        document.getElementById('preset-sets').value = p.sets;
        document.getElementById('preset-rest-sets').value = p.restBetweenSets || 0;
        document.getElementById('preset-cooldown').value = p.cooldown;
        els.deletePresetBtn.classList.remove('hidden');
    } else {
        els.formView.querySelector('#form-title').innerText = 'New Timer';
        document.getElementById('preset-name').value = '';
        document.getElementById('preset-prep').value = 10;
        document.getElementById('preset-work').value = 20;
        document.getElementById('preset-rest').value = 10;
        document.getElementById('preset-sets').value = 8;
        document.getElementById('preset-rest-sets').value = 0;
        document.getElementById('preset-cooldown').value = 0;
        els.deletePresetBtn.classList.add('hidden');
    }
    els.formView.classList.remove('hidden');
}

window.editPreset = function(e, id) {
    e.stopPropagation();
    openForm(id);
};

window.openTimerDirect = function(e, id) {
    e.stopPropagation();
    openTimer(id);
};

window.deletePresetDirect = function(e, id) {
    e.stopPropagation();
    if (confirm('Delete this timer?')) {
        state.presets = state.presets.filter(p => p.id !== id);
        saveData();
        renderView('presets');
    }
};

window.duplicatePresetDirect = function(e, id) {
    e.stopPropagation();
    const p = state.presets.find(x => x.id === id);
    if(p) {
        const copy = JSON.parse(JSON.stringify(p));
        copy.id = Date.now().toString();
        copy.name = copy.name + ' (Copy)';
        state.presets.push(copy);
        saveData();
        renderView('presets');
    }
};

window.openTimer = function(id) {
    const p = state.presets.find(x => x.id === id);
    if (!p) return;
    currentTimer = p;
    buildPhases(p);
    els.playerTitle.innerText = p.name;
    els.playerView.classList.remove('hidden');
    document.getElementById('bottom-nav').classList.add('nav-hidden'); // Hide nav when player opens
    resetTimer();
};
