document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const navToggle = document.querySelector('.nav-toggle');
const navDrawer = document.querySelector('.nav-drawer');
const navBackdrop = document.querySelector('.nav-backdrop');

const setNav = (open) => {
  if (!navToggle || !navDrawer || !navBackdrop) return;
  navDrawer.classList.toggle('open', open);
  navBackdrop.classList.toggle('active', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navDrawer.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('nav-open', open);
};

if (navToggle && navDrawer && navBackdrop) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setNav(!isOpen);
  });
  navBackdrop.addEventListener('click', () => setNav(false));
  document.querySelectorAll('.nav-drawer-links a').forEach(link => {
    link.addEventListener('click', () => setNav(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNav(false);
  });
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ── Status das máquinas (Sislav via app.talimpolavanderia.com/api/machines) ──
const machinesPanel = document.getElementById('machines-panel');
const machinesUpdated = document.getElementById('machines-updated');

if (machinesPanel) {
  const API = 'https://app.talimpolavanderia.com/api/machines';
  const POLL_MS = 30000;
  let lastFetchAt = 0;
  let timeTickInterval = null;

  const ICONS = {
    WASHER: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="5"/><circle cx="8" cy="6" r=".7" fill="currentColor"/><circle cx="11" cy="6" r=".7" fill="currentColor"/></svg>',
    DRYER:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M10 11.5c.7.5 1.3.5 2 0s1.3-.5 2 0"/></svg>',
  };

  const formatRelative = (timestamp) => {
    const sec = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
    if (sec < 5) return 'Atualizado agora';
    if (sec < 60) return `Atualizado há ${sec}s`;
    const min = Math.floor(sec / 60);
    return `Atualizado há ${min} min`;
  };

  const renderError = () => {
    machinesPanel.innerHTML = `
      <div class="machines-error">
        Não conseguimos carregar agora. Tente novamente em instantes.
      </div>`;
    machinesPanel.setAttribute('aria-busy', 'false');
  };

  const renderMachines = (data) => {
    if (!Array.isArray(data) || data.length === 0) { renderError(); return; }

    const washers = data.filter(m => m.type === 'WASHER');
    const dryers  = data.filter(m => m.type === 'DRYER');
    const total   = data.length;
    const free    = data.filter(m => m.status === 'AVAILABLE').length;

    const card = (m) => {
      const free = m.status === 'AVAILABLE';
      return `
        <div class="m-card ${free ? 'is-free' : 'is-busy'}">
          <div class="m-num">${m.name}</div>
          <div class="m-status"><span class="m-dot"></span>${free ? 'Livre' : 'Em uso'}</div>
        </div>`;
    };

    const col = (title, icon, list) => `
      <div class="machines-col">
        <h3>${icon} ${title}</h3>
        <div class="machines-list">${list.map(card).join('')}</div>
      </div>`;

    machinesPanel.innerHTML = `
      <div class="machines-grid">
        ${col('Lavadoras', ICONS.WASHER, washers)}
        ${col('Secadoras', ICONS.DRYER, dryers)}
      </div>
      <div class="m-summary">
        <span><strong>${free}</strong> livres</span>
        <span><strong>${total - free}</strong> em uso</span>
        <span>Total: <strong>${total}</strong></span>
      </div>`;
    machinesPanel.setAttribute('aria-busy', 'false');
  };

  const updateRelativeTime = () => {
    if (lastFetchAt && machinesUpdated) machinesUpdated.textContent = formatRelative(lastFetchAt);
  };

  const fetchMachines = async () => {
    try {
      const res = await fetch(API, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      lastFetchAt = Date.now();
      renderMachines(data);
      updateRelativeTime();
    } catch {
      if (!lastFetchAt) renderError();
    }
  };

  fetchMachines();
  setInterval(fetchMachines, POLL_MS);
  timeTickInterval = setInterval(updateRelativeTime, 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fetchMachines();
  });
}
