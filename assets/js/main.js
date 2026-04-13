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
const navClose = document.querySelector('.nav-close');
const navBackdrop = document.querySelector('.nav-backdrop');

const openNavDrawer = () => {
  navDrawer.classList.add('open');
  navBackdrop.classList.add('active');
  navToggle.setAttribute('aria-expanded', 'true');
  navDrawer.setAttribute('aria-hidden', 'false');
};

const closeNavDrawer = () => {
  navDrawer.classList.remove('open');
  navBackdrop.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  navDrawer.setAttribute('aria-hidden', 'true');
};

if (navToggle && navDrawer && navClose && navBackdrop) {
  navToggle.addEventListener('click', openNavDrawer);
  navClose.addEventListener('click', closeNavDrawer);
  navBackdrop.addEventListener('click', closeNavDrawer);
  document.querySelectorAll('.nav-drawer-links a').forEach(link => {
    link.addEventListener('click', closeNavDrawer);
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
