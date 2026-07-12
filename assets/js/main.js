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

  const cycleProgress = (m) => {
    const start = Date.parse(m.startDate);
    const end = Date.parse(m.endDate);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    const now = Date.now();
    const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    const minLeft = Math.ceil((end - now) / 60000);
    const label = minLeft <= 0 ? 'Finalizando…' : (minLeft === 1 ? 'Falta ~1 min' : `Faltam ~${minLeft} min`);
    return { pct, label };
  };

  const renderMachines = (data) => {
    const machines = Array.isArray(data) ? data
      : (data && Array.isArray(data.machines)) ? data.machines
      : null;
    if (!machines || machines.length === 0) { renderError(); return; }

    const washers = machines.filter(m => m.type === 'WASHER');
    const dryers  = machines.filter(m => m.type === 'DRYER');
    const total   = machines.length;
    const free    = machines.filter(m => m.status === 'AVAILABLE').length;

    const card = (m) => {
      const free = m.status === 'AVAILABLE';
      const prog = free ? null : cycleProgress(m);
      const progHtml = prog ? `
          <div class="m-progress" data-start="${m.startDate}" data-end="${m.endDate}">
            <div class="m-progress-track"><div class="m-progress-bar" style="width:${prog.pct.toFixed(1)}%"></div></div>
            <div class="m-remaining">${prog.label}</div>
          </div>` : '';
      return `
        <div class="m-card ${free ? 'is-free' : 'is-busy'}">
          <div class="m-num">${m.name}</div>
          <div class="m-status"><span class="m-dot"></span>${free ? 'Livre' : 'Em uso'}</div>${progHtml}
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

  const updateProgressBars = () => {
    machinesPanel.querySelectorAll('.m-progress').forEach(el => {
      const prog = cycleProgress({ startDate: el.dataset.start, endDate: el.dataset.end });
      if (!prog) return;
      const bar = el.querySelector('.m-progress-bar');
      const remaining = el.querySelector('.m-remaining');
      if (bar) bar.style.width = `${prog.pct.toFixed(1)}%`;
      if (remaining) remaining.textContent = prog.label;
    });
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
  timeTickInterval = setInterval(() => { updateRelativeTime(); updateProgressBars(); }, 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fetchMachines();
  });
}
