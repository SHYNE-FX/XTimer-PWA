// App State
const state = {
    version: '4.10', // [F] Update version
    presets: [],
    records: [],
    activeView: 'presets', // 'presets', 'dashboard', 'settings'
    settings: {
        theme: 'dark', // 'light' or 'dark'
        mainColor: '#5669BD', // [B] Renamed from accentColor
        accentColor: '#FF4B4B', // [B] Renamed from secondaryColor
        prepColor: '#AFBEFF',
        restColor: '#5669BD',
        workColor: '#FF6B6B',
        fontSize: 'medium', // 'small', 'medium', 'large'
        fontFamily: 'instrument'
    }
};

const APP_DATA_KEY = 'rhett_data_v4_2'; // New key for 4.9 data

// Data Management
function loadData() {
    const data = localStorage.getItem(APP_DATA_KEY);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            state.presets = parsed.presets || [];
            state.records = parsed.records || [];
            if(parsed.settings) {
                // Migration for renamed keys if needed
                if (parsed.settings.accentColor && !parsed.settings.mainColor) {
                    state.settings.mainColor = parsed.settings.accentColor;
                }
                if (parsed.settings.secondaryColor && !parsed.settings.accentColor) {
                    state.settings.accentColor = parsed.settings.secondaryColor;
                }
                Object.assign(state.settings, parsed.settings);
            }
        } catch (e) {
            console.error('Failed to parse localStorage data', e);
        }
    } else {
        // Try loading from old version if exists
        const oldData = localStorage.getItem('rhett_data_v2');
        if (oldData) {
            try {
                const parsed = JSON.parse(oldData);
                state.presets = parsed.presets || [];
                state.records = parsed.records || [];
                // Apply manual mapping for settings
                if (parsed.settings) {
                    state.settings.mainColor = parsed.settings.accentColor || '#5669BD';
                    state.settings.accentColor = parsed.settings.secondaryColor || '#FF4B4B';
                    state.settings.prepColor = parsed.settings.prepColor || '#AFBEFF';
                    state.settings.restColor = parsed.settings.restColor || '#5669BD';
                    state.settings.workColor = parsed.settings.workColor || '#FF6B6B';
                }
            } catch (e) {}
        }
    }
    applySettings();
}

function saveData() {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify({
        presets: state.presets,
        records: state.records,
        settings: state.settings
    }));
}

function applySettings() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    document.documentElement.style.setProperty('--sky-blue', state.settings.mainColor);
    document.documentElement.style.setProperty('--accent-color', state.settings.accentColor || '#FF4B4B');
    document.documentElement.style.setProperty('--prep-color', state.settings.prepColor || '#AFBEFF');
    document.documentElement.style.setProperty('--rest-color', state.settings.restColor || '#5669BD');
    document.documentElement.style.setProperty('--work-color', state.settings.workColor || '#FF6B6B');
    document.documentElement.setAttribute('data-fontsize', state.settings.fontSize);
    document.documentElement.setAttribute('data-font', state.settings.fontFamily || 'instrument');
}
