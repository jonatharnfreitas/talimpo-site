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
