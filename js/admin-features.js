/* ============================================================
   ADMIN FEATURES: PROFILE UPLOAD, SOCIAL LINKS, CV, SETTINGS, GALLERY
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('adminDashboard')) return;
    initProfileSettings();
    loadAllSettings();
    ensureSaveButton();
});

function initProfileSettings() {
    const profileInput = document.getElementById('profileImageInput');
    const profilePreview = document.getElementById('profilePreview');
    const removeBtn = document.getElementById('removeProfileBtn');
    const cvInput = document.getElementById('cvFileInput');
    const cvFileName = document.getElementById('cvFileName');

    const settings = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
    if (settings.profileImage && profilePreview) {
        profilePreview.innerHTML = `<img src="${settings.profileImage}" alt="Profile">`;
        profilePreview.classList.add('has-image');
    }
    if (settings.cvFileName && cvFileName) {
        cvFileName.textContent = settings.cvFileName;
    }

    profileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { Utils.showToast('Image must be under 2MB', 'error'); return; }
        try {
            const dataUrl = await Utils.readFileAsDataURL(file);
            profilePreview.innerHTML = `<img src="${dataUrl}" alt="Profile">`;
            profilePreview.classList.add('has-image');
            const s = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
            s.profileImage = dataUrl;
            Utils.setStorage(Utils.STORAGE_KEYS.SETTINGS, s);
            Utils.showToast('Profile picture updated', 'success');
        } catch { Utils.showToast('Failed to upload image', 'error'); }
    });

    removeBtn?.addEventListener('click', () => {
        profilePreview.innerHTML = '<i class="fas fa-user"></i>';
        profilePreview.classList.remove('has-image');
        const s = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
        delete s.profileImage;
        Utils.setStorage(Utils.STORAGE_KEYS.SETTINGS, s);
        Utils.showToast('Profile picture removed', 'success');
    });

    cvInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { Utils.showToast('CV must be under 5MB', 'error'); return; }
        try {
            const dataUrl = await Utils.readFileAsDataURL(file);
            cvFileName.textContent = file.name;
            const s = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
            s.cvFile = dataUrl;
            s.cvFileName = file.name;
            Utils.setStorage(Utils.STORAGE_KEYS.SETTINGS, s);
            Utils.showToast('CV uploaded', 'success');
        } catch { Utils.showToast('Failed to upload CV', 'error'); }
    });
}

function loadAllSettings() {
    const s = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
    const map = {
        settingSiteTitle: s.siteTitle || 'Shadat Hossain',
        settingSiteDesc: s.siteDesc || 'Network & Security Engineer Portfolio',
        settingDisplayName: s.displayName || 'Shadat Hossain',
        settingTitle: s.title || 'Network & Security Engineer',
        settingTagline: s.tagline || 'Available for opportunities',
        settingCvButtonText: s.cvButtonText || 'View CV',
        settingGithub: s.github || '',
        settingLinkedin: s.linkedin || '',
        settingTwitter: s.twitter || '',
        settingFacebook: s.facebook || '',
        settingWhatsapp: s.whatsapp || '',
        settingEmail: s.email || 'sahadat.bda35@gmail.com',
        settingPhone: s.phone || '+880 1575 382663',
        settingNotifyEmail: s.notifyEmail || 'sahadat.bda35@gmail.com'
    };
    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
    const autoReply = document.getElementById('settingAutoReply');
    if (autoReply) autoReply.checked = s.autoReply !== false;
}

function ensureSaveButton() {
    if (document.getElementById('saveSettingsBtn')) return;
    const container = document.querySelector('.settings-container');
    if (!container) return;
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.id = 'saveSettingsBtn';
    btn.style.marginTop = 'var(--space-xl)';
    btn.innerHTML = '<i class="fas fa-save"></i> Save All Settings';
    btn.addEventListener('click', saveAllSettings);
    container.appendChild(btn);
}

function saveAllSettings() {
    const s = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
    const fields = [
        'settingSiteTitle', 'settingSiteDesc', 'settingDisplayName', 'settingTitle',
        'settingTagline', 'settingCvButtonText', 'settingGithub', 'settingLinkedin',
        'settingTwitter', 'settingFacebook', 'settingWhatsapp', 'settingEmail',
        'settingPhone', 'settingNotifyEmail'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const key = id.replace('setting', '').replace(/^./, c => c.toLowerCase());
        s[key] = el.value;
    });
    const autoReply = document.getElementById('settingAutoReply');
    if (autoReply) s.autoReply = autoReply.checked;
    Utils.setStorage(Utils.STORAGE_KEYS.SETTINGS, s);
    Utils.showToast('All settings saved successfully', 'success');
}
