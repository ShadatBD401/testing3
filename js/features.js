/* ============================================================
   FEATURES: THEMES, GLOBAL SEARCH, CUSTOM CURSOR, TICKET TRACKING, CV
   ============================================================ */

// ── Theme Management ─────────────────────────────────────────
const THEMES = ['dark', 'light', 'ocean', 'forest', 'sunset'];

function initThemeSwitcher() {
    const switcher = document.getElementById('themeSwitcher');
    const toggle = document.getElementById('themeSwitcherToggle');
    const swatches = document.querySelectorAll('.theme-swatch');
    const themeToggle = document.getElementById('themeToggle');

    // Load saved theme
    const savedTheme = Utils.getStorage(Utils.STORAGE_KEYS.THEME, 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateSwatchUI(savedTheme);

    // Toggle open/close
    toggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        switcher.classList.toggle('open');
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (switcher && !switcher.contains(e.target)) {
            switcher.classList.remove('open');
        }
    });

    // Swatch clicks
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const theme = swatch.dataset.theme;
            applyTheme(theme);
        });
    });

    // Navbar theme toggle cycles themes
    themeToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        const current = Utils.getStorage(Utils.STORAGE_KEYS.THEME, 'dark');
        const idx = THEMES.indexOf(current);
        const next = THEMES[(idx + 1) % THEMES.length];
        applyTheme(next);
        Utils.showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`, 'info');
    });
}

function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    Utils.setStorage(Utils.STORAGE_KEYS.THEME, theme);
    updateSwatchUI(theme);
    updateThemeIcon(theme);
}

function updateSwatchUI(theme) {
    document.querySelectorAll('.theme-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.theme === theme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (!icon) return;
    const icons = {
        dark: 'fa-moon',
        light: 'fa-sun',
        ocean: 'fa-water',
        forest: 'fa-tree',
        sunset: 'fa-fire'
    };
    icon.className = `fas ${icons[theme] || 'fa-palette'}`;
}

// ── Global Search ────────────────────────────────────────────
function initGlobalSearch() {
    const trigger = document.getElementById('searchTrigger');
    const modal = document.getElementById('globalSearch');
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('globalSearchResults');
    if (!modal) return;

    let searchIndex = [];

    function buildIndex() {
        searchIndex = [
            { title: 'Home', type: 'Section', icon: 'fa-home', action: () => goTo('home') },
            { title: 'About Me', type: 'Section', icon: 'fa-user', action: () => goTo('about') },
            { title: 'Experience', type: 'Section', icon: 'fa-briefcase', action: () => goTo('experience') },
            { title: 'Technical Skills', type: 'Section', icon: 'fa-cogs', action: () => goTo('technical') },
            { title: 'Projects', type: 'Section', icon: 'fa-project-diagram', action: () => goTo('projects') },
            { title: 'Certifications', type: 'Section', icon: 'fa-certificate', action: () => goTo('certifications') },
            { title: 'Education', type: 'Section', icon: 'fa-graduation-cap', action: () => goTo('education') },
            { title: 'Learning Blog', type: 'Section', icon: 'fa-book', action: () => goTo('learning') },
            { title: 'Contact', type: 'Section', icon: 'fa-envelope', action: () => goTo('contact') }
        ];

        Utils.getItems(Utils.STORAGE_KEYS.PROJECTS).forEach(p => {
            searchIndex.push({
                title: p.title,
                description: Utils.truncate((p.description || '').replace(/[•\n]/g, ' ').trim(), 70),
                type: 'Project', icon: 'fa-project-diagram', action: () => goTo('projects')
            });
        });

        Utils.getItems(Utils.STORAGE_KEYS.CERTS).forEach(c => {
            searchIndex.push({
                title: c.title, description: c.description || '',
                type: 'Certification', icon: 'fa-certificate', action: () => goTo('certifications')
            });
        });

        Utils.getItems(Utils.STORAGE_KEYS.SKILLS).forEach(s => {
            searchIndex.push({
                title: s.title, description: Utils.truncate(s.desc || '', 70),
                type: 'Skill', icon: 'fa-cog', action: () => goTo('technical')
            });
        });

        Utils.getItems(Utils.STORAGE_KEYS.POSTS).forEach(p => {
            searchIndex.push({
                title: p.title, description: Utils.truncate(p.summary || p.content || '', 70),
                type: 'Blog Post', icon: 'fa-blog', action: () => goTo('learning')
            });
        });
    }

    function goTo(sectionId) {
        closeSearch();
        const target = document.getElementById(sectionId);
        if (target) {
            const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
            window.scrollTo({ top: target.offsetTop - navHeight, behavior: 'smooth' });
        }
    }

    function openSearch() {
        buildIndex();
        modal.classList.add('open');
        document.body.classList.add('modal-open');
        setTimeout(() => input?.focus(), 100);
        renderResults('');
    }

    function closeSearch() {
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        if (input) input.value = '';
    }

    function renderResults(query) {
        if (!results) return;
        const q = query.toLowerCase().trim();

        let items;
        if (!q) {
            items = searchIndex.slice(0, 6);
        } else {
            items = searchIndex.filter(it =>
                it.title.toLowerCase().includes(q) ||
                (it.description && it.description.toLowerCase().includes(q)) ||
                it.type.toLowerCase().includes(q)
            ).slice(0, 10);
        }

        if (!items.length) {
            results.innerHTML = `<div class="search-no-results">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No results found${q ? ` for "${Utils.esc(query)}"` : ''}</p>
            </div>`;
            return;
        }

        results.innerHTML = items.map((it, i) => `
            <div class="search-result-item" data-idx="${i}">
                <div class="search-result-icon"><i class="fas ${it.icon}"></i></div>
                <div class="search-result-content">
                    <div class="search-result-title">${Utils.esc(it.title)}</div>
                    ${it.description ? `<div class="search-result-type">${Utils.esc(it.description)}</div>` : ''}
                    <div class="search-result-type">${it.type}</div>
                </div>
            </div>
        `).join('');

        results.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => items[+el.dataset.idx].action());
        });
    }

    trigger?.addEventListener('click', openSearch);
    input?.addEventListener('input', Utils.debounce(e => renderResults(e.target.value), 150));

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            modal.classList.contains('open') ? closeSearch() : openSearch();
        }
        if (e.key === 'Escape' && modal.classList.contains('open')) closeSearch();
    });

    modal.addEventListener('click', e => {
        if (e.target === modal) closeSearch();
    });
}

// ── Custom Mouse Cursor (Smokey) ─────────────────────────────
function initCustomCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';

    const follower = document.createElement('div');
    follower.className = 'cursor-follower';

    const smoke = document.createElement('div');
    smoke.className = 'cursor-smoke';

    document.body.appendChild(cursor);
    document.body.appendChild(follower);
    document.body.appendChild(smoke);

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let cX = mouseX, cY = mouseY;
    let fX = mouseX, fY = mouseY;
    let sX = mouseX, sY = mouseY;
    let smokeTimer = null;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        smoke.classList.add('active');
        clearTimeout(smokeTimer);
        smokeTimer = setTimeout(() => smoke.classList.remove('active'), 600);
    });

    function animate() {
        cX += (mouseX - cX) * 0.5;
        cY += (mouseY - cY) * 0.5;
        cursor.style.transform = `translate(${cX - 6}px, ${cY - 6}px)`;

        fX += (mouseX - fX) * 0.15;
        fY += (mouseY - fY) * 0.15;
        follower.style.transform = `translate(${fX - 20}px, ${fY - 20}px)`;

        sX += (mouseX - sX) * 0.08;
        sY += (mouseY - sY) * 0.08;
        smoke.style.transform = `translate(${sX - 100}px, ${sY - 100}px)`;

        requestAnimationFrame(animate);
    }
    animate();

    const selector = 'a, button, [role="button"], input, textarea, select, .clickable, .project-card, .skill-card, .cert-card, .learning-card, .ticket-card, .admin-item-card, .sidebar-link, .theme-swatch';

    document.addEventListener('mouseover', e => {
        if (e.target.closest(selector)) {
            cursor.classList.add('hovering');
            follower.classList.add('hovering');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(selector)) {
            cursor.classList.remove('hovering');
            follower.classList.remove('hovering');
        }
    });
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
}

// ── Ticket Tracking ──────────────────────────────────────────
function initTicketTracking() {
    const trackBtn = document.getElementById('trackTicketBtn');
    const trackInput = document.getElementById('ticketTrackInput');
    const resultBox = document.getElementById('ticketTrackResult');
    if (!trackBtn || !trackInput || !resultBox) return;

    trackInput.addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    });

    function track() {
        const id = trackInput.value.trim();
        if (!id) {
            Utils.showToast('Please enter a ticket ID', 'error');
            return;
        }

        const tickets = Utils.getItems(Utils.STORAGE_KEYS.TICKETS);
        const ticket = tickets.find(t => t.id.toUpperCase() === id.toUpperCase());

        if (!ticket) {
            resultBox.innerHTML = `
                <div class="ticket-status-card" style="border-left: 3px solid var(--accent-danger);">
                    <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <i class="fas fa-times-circle" style="color: var(--accent-danger); font-size: 1.5rem;"></i>
                        <div>
                            <p style="font-weight: 600;">Ticket Not Found</p>
                            <p style="color: var(--text-muted); font-size: 0.875rem;">
                                No ticket with ID "${Utils.esc(id)}". Please check and try again.
                            </p>
                        </div>
                    </div>
                </div>`;
            return;
        }

        const statuses = (window.TicketSystem && TicketSystem.TICKET_STATUSES) || {};
        const priorities = (window.TicketSystem && TicketSystem.TICKET_PRIORITIES) || {};
        const st = statuses[ticket.status] || { label: 'Open', color: '#3b82f6', icon: 'fa-folder-open' };
        const pr = priorities[ticket.priority] || { label: 'Medium', color: '#3b82f6', icon: 'fa-minus' };

        resultBox.innerHTML = `
            <div class="ticket-status-card">
                <div class="ticket-status-header">
                    <span class="ticket-status-id">${Utils.esc(ticket.id)}</span>
                    <span class="ticket-status-badge" style="background: ${st.color}20; color: ${st.color};">
                        <i class="fas ${st.icon}"></i> ${st.label}
                    </span>
                </div>
                <h4 style="margin-bottom: var(--space-sm);">${Utils.esc(ticket.subject)}</h4>
                <div style="display: flex; gap: var(--space-lg); font-size: 0.8125rem; color: var(--text-muted); margin-bottom: var(--space-md); flex-wrap: wrap;">
                    <span><i class="fas fa-calendar"></i> ${Utils.formatDate(ticket.createdAt)}</span>
                    <span><i class="fas fa-clock"></i> ${Utils.timeAgo(ticket.updatedAt)}</span>
                    <span style="color: ${pr.color};"><i class="fas ${pr.icon}"></i> ${pr.label}</span>
                </div>
                ${ticket.replies && ticket.replies.length ? `
                    <div class="ticket-timeline">
                        <p style="font-weight: 500; margin-bottom: var(--space-sm);">Recent Updates:</p>
                        ${ticket.replies.slice(-3).map(r => `
                            <div class="ticket-timeline-item">
                                <span class="ticket-timeline-time">${Utils.formatDateTime(r.timestamp)}</span>
                                <span>${r.isAdmin ? '🛡️ Admin replied' : '📝 Your message'}</span>
                            </div>`).join('')}
                    </div>` : `
                    <p style="color: var(--text-muted); font-size: 0.875rem;">
                        <i class="fas fa-info-circle"></i> No replies yet. We'll respond soon.
                    </p>`}
            </div>`;
    }

    trackBtn.addEventListener('click', track);
    trackInput.addEventListener('keypress', e => { if (e.key === 'Enter') track(); });
}

// ── CV Viewer ────────────────────────────────────────────────
function initCvViewer() {
    const btn = document.getElementById('viewCvBtn');
    const btnText = document.getElementById('cvBtnText');
    if (!btn) return;

    const settings = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
    if (btnText && settings.cvButtonText) btnText.textContent = settings.cvButtonText;

    btn.addEventListener('click', () => {
        const s = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
        if (!s.cvFile) {
            Utils.showToast('CV not uploaded yet', 'warning');
            return;
        }
        const link = document.createElement('a');
        link.href = s.cvFile;
        link.download = s.cvFileName || 'CV.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// ── Apply Admin Settings to Public Site ──────────────────────
function applySiteSettings() {
    const s = Utils.getStorage(Utils.STORAGE_KEYS.SETTINGS, {});
    if (!Object.keys(s).length) return;

    // Profile image → Hero terminal (or avatar container)
    if (s.profileImage) {
        const heroTerminal = document.querySelector('.hero-terminal');
        if (heroTerminal && !document.getElementById('heroProfileImg')) {
            const avatar = document.createElement('div');
            avatar.id = 'heroProfileImg';
            avatar.style.cssText = 'position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;overflow:hidden;border:3px solid var(--accent-primary);box-shadow:var(--shadow-glow);background:var(--bg-secondary);z-index:10;';
            avatar.innerHTML = `<img src="${s.profileImage}" alt="Profile" style="width:100%;height:100%;object-fit:cover;">`;
            heroTerminal.style.position = 'relative';
            heroTerminal.appendChild(avatar);
        }
    }

    // Social links in navbar
    const navSocial = document.querySelector('.nav-social');
    if (navSocial) {
        const links = [];
        if (s.github) links.push(`<a href="${Utils.esc(s.github)}" target="_blank" rel="noopener" title="GitHub"><i class="fab fa-github"></i></a>`);
        if (s.linkedin) links.push(`<a href="${Utils.esc(s.linkedin)}" target="_blank" rel="noopener" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>`);
        if (s.facebook) links.push(`<a href="${Utils.esc(s.facebook)}" target="_blank" rel="noopener" title="Facebook"><i class="fab fa-facebook-f"></i></a>`);
        if (s.twitter) links.push(`<a href="${Utils.esc(s.twitter)}" target="_blank" rel="noopener" title="Twitter"><i class="fab fa-twitter"></i></a>`);
        if (links.length) navSocial.innerHTML = links.join('');
    }

    // Dynamic contact links (LinkedIn, Facebook, Twitter, GitHub)
    const dyn = document.getElementById('dynamicContactLinks');
    if (dyn) {
        const extra = [];
        if (s.linkedin) extra.push(contactCard('LinkedIn', 'fab fa-linkedin-in', s.linkedin));
        if (s.facebook) extra.push(contactCard('Facebook', 'fab fa-facebook-f', s.facebook));
        if (s.twitter) extra.push(contactCard('Twitter', 'fab fa-twitter', s.twitter));
        if (s.github) extra.push(contactCard('GitHub', 'fab fa-github', s.github));
        dyn.innerHTML = extra.join('');
    }

    // Update hero badge tagline
    if (s.tagline) {
        const badge = document.querySelector('.hero-badge span:last-child');
        if (badge) badge.textContent = s.tagline;
    }
}

function contactCard(label, icon, url) {
    return `<a href="${Utils.esc(url)}" class="contact-card" target="_blank" rel="noopener">
        <div class="contact-icon"><i class="${icon}"></i></div>
        <div class="contact-details">
            <div class="contact-label">${label}</div>
            <div class="contact-value">${Utils.esc(url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</div>
        </div>
    </a>`;
}

// ── Init on DOM ready ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initGlobalSearch();
    initCustomCursor();
    initTicketTracking();
    initCvViewer();
    applySiteSettings();
});
