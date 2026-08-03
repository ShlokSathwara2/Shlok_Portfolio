/* ═══════════════════════════════════════════════
   SHLOK SATHWARA — PORTFOLIO SCRIPTS
   10 Animations: Magnetic Cursor, Text Scramble,
   Particles, 3D Tilt, Parallax, Spring Reveal,
   Scroll Progress, Counter, SVG Draw, Neon Glow
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════════
  // 1. MAGNETIC CURSOR
  // ══════════════════════════════════════════
  const cursorDot = document.createElement('div');
  const cursorTrail = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  cursorTrail.className = 'cursor-trail';
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorTrail);

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Cursor hover states
  const hoverTargets = document.querySelectorAll('a, button, .project-card, .stat-card, .skill-category, .cert-card, .honor-item, .education-card, .achievement-card, .testimonial-card, .building-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.classList.add('cursor-hover');
      cursorTrail.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('cursor-hover');
      cursorTrail.classList.remove('cursor-hover');
    });
  });

  // Magnetic effect on buttons and links
  const magneticEls = document.querySelectorAll('.btn-explore, .btn-outline, .nav-cta, .social-link, .nav-link');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      el.style.transition = 'transform 0.2s ease';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.03, 0.98, 0.52, 0.99)';
    });
  });


  // ══════════════════════════════════════════
  // 2. TEXT SCRAMBLE ON SCROLL
  // ══════════════════════════════════════════
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.originalText = el.textContent;
      this.isScrambled = false;
    }

    scramble() {
      if (this.isScrambled) return;
      this.isScrambled = true;
      const original = this.originalText;
      const len = original.length;
      let iteration = 0;
      const maxIterations = len * 2;

      const interval = setInterval(() => {
        this.el.textContent = original
          .split('')
          .map((char, i) => {
            if (i < iteration / 2) return original[i];
            if (char === ' ') return ' ';
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('');

        iteration++;
        if (iteration > maxIterations) {
          clearInterval(interval);
          this.el.textContent = original;
        }
      }, 30);
    }
  }

  const scrambleEls = document.querySelectorAll('.section-title, .hero-name');
  const scrambleInstances = [];
  scrambleEls.forEach(el => {
    const instance = new TextScramble(el);
    scrambleInstances.push(instance);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          instance.scramble();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });


  // ══════════════════════════════════════════
  // 3. INTERACTIVE PARTICLE BACKGROUND
  // ══════════════════════════════════════════
  const heroSection = document.querySelector('.hero');
  const particleCanvas = document.createElement('canvas');
  particleCanvas.id = 'particleCanvas';
  particleCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  heroSection.style.position = 'relative';
  heroSection.insertBefore(particleCanvas, heroSection.firstChild);

  const ctx = particleCanvas.getContext('2d');
  let particles = [];
  const particleCount = 80;
  const connectionDistance = 120;
  let particleMouseX = 0, particleMouseY = 0;

  function resizeCanvas() {
    particleCanvas.width = heroSection.offsetWidth;
    particleCanvas.height = heroSection.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    particleMouseX = e.clientX - rect.left;
    particleMouseY = e.clientY - rect.top;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * particleCanvas.width;
      this.y = Math.random() * particleCanvas.height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      const dx = this.x - particleMouseX;
      const dy = this.y - particleMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }

      // Damping
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Bounds
      if (this.x < 0 || this.x > particleCanvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > particleCanvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistance) {
          const opacity = (1 - dist / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  // ══════════════════════════════════════════
  // 4. ENHANCED 3D CARD TILT + GLARE
  // ══════════════════════════════════════════
  document.querySelectorAll('.project-card, .stat-card, .skill-category, .cert-card, .education-card, .achievement-card, .testimonial-card, .building-card').forEach(card => {
    // Add glare element
    const glare = document.createElement('div');
    glare.className = 'card-glare';
    card.appendChild(glare);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const tiltX = ((y - centerY) / centerY) * -8;
      const tiltY = ((x - centerX) / centerX) * 8;

      // Glare position
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease';
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
      glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99)';
      glare.style.opacity = '0';
    });
  });


  // ══════════════════════════════════════════
  // 5. PARALLAX SCROLLING
  // ══════════════════════════════════════════
  const parallaxElements = document.querySelectorAll('.hero-photo-wrapper, .mesh-blob');

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxElements.forEach((el, i) => {
      const speed = (i + 1) * 0.15;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateParallax);
  });


  // ══════════════════════════════════════════
  // 6. SPRING BOUNCE REVEAL (replaces old reveal)
  // ══════════════════════════════════════════
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach(el => revealObserver.observe(el));


  // ══════════════════════════════════════════
  // 7. SCROLL PROGRESS BAR
  // ══════════════════════════════════════════
  const progressBar = document.createElement('div');
  progressBar.id = 'scrollProgress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  });


  // ══════════════════════════════════════════
  // 8. COUNTER COUNT-UP
  // ══════════════════════════════════════════
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  function animateCounter(el) {
    const text = el.textContent;
    const hasPlus = text.includes('+');
    const target = parseFloat(text.replace('+', ''));
    const isDecimal = text.includes('.');
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Elastic easing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * (2 * Math.PI / 3));

      const current = eased * target;
      el.textContent = (isDecimal ? current.toFixed(2) : Math.floor(current)) + (hasPlus ? '+' : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    el.textContent = isDecimal ? '0.00' : '0';
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        statNumbers.forEach(el => animateCounter(el));
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.about-stats');
  if (statsSection) counterObserver.observe(statsSection);


  // ══════════════════════════════════════════
  // 9. SVG PATH DRAWING (section tags)
  // ══════════════════════════════════════════
  const sectionTags = document.querySelectorAll('.section-tag');
  sectionTags.forEach(tag => {
    const text = tag.textContent;
    tag.textContent = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 50 30');
    svg.setAttribute('width', '50');
    svg.setAttribute('height', '30');
    svg.classList.add('section-tag-svg');

    const pathText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    pathText.setAttribute('x', '25');
    pathText.setAttribute('y', '22');
    pathText.setAttribute('text-anchor', 'middle');
    pathText.setAttribute('fill', 'none');
    pathText.setAttribute('stroke', 'currentColor');
    pathText.setAttribute('stroke-width', '0.5');
    pathText.setAttribute('font-size', '16');
    pathText.setAttribute('font-family', 'Space Grotesk, sans-serif');
    pathText.setAttribute('font-weight', '700');
    pathText.textContent = text;

    const pathLength = pathText.getComputedTextLength ? 100 : 100;
    pathText.setAttribute('stroke-dasharray', pathLength);
    pathText.setAttribute('stroke-dashoffset', pathLength);

    svg.appendChild(pathText);
    tag.appendChild(svg);

    const svgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          pathText.style.transition = 'stroke-dashoffset 1.5s ease, fill 0.5s ease 1s';
          pathText.setAttribute('stroke-dashoffset', '0');
          pathText.setAttribute('fill', 'currentColor');
          svgObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    svgObserver.observe(tag);
  });


  // ══════════════════════════════════════════
  // 10. RIPPLE CLICK EFFECT
  // ══════════════════════════════════════════
  function createRipple(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      width:${size}px;height:${size}px;left:${x}px;top:${y}px;
      background:radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%);
      transform:scale(0);animation:ripple-expand 0.6s ease-out forwards;
      z-index:10;
    `;

    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  document.querySelectorAll('.btn-explore, .btn-outline, .nav-cta, .social-link, .contact-link-item, .stat-card, .honor-item, .achievement-card, .testimonial-card').forEach(el => {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', createRipple);
  });

  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes ripple-expand {
      0%   { transform: scale(0); opacity: 1; }
      100% { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);


  // ══════════════════════════════════════════
  // NAVBAR SCROLL
  // ══════════════════════════════════════════
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });


  // ══════════════════════════════════════════
  // ACTIVE NAV LINK
  // ══════════════════════════════════════════
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(section => sectionObserver.observe(section));


  // ══════════════════════════════════════════
  // SMOOTH ANCHOR SCROLL
  // ══════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      document.getElementById('mobileMenu').classList.remove('open');
      document.getElementById('hamburger').classList.remove('active');
      document.body.style.overflow = '';
    });
  });


  // ══════════════════════════════════════════
  // MOBILE HAMBURGER MENU
  // ══════════════════════════════════════════
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });


  // ══════════════════════════════════════════
  // TYPING ANIMATION
  // ══════════════════════════════════════════
  const typingEl = document.getElementById('typingText');
  const phrases = [
    'AI-powered applications',
    'full-stack web apps',
    'intelligent systems',
    'scalable backend APIs',
    'smart automation tools'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typingEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      typingEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400;
    }

    setTimeout(typeEffect, typeSpeed);
  }
  typeEffect();

});
