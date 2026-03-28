document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - navHeight;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // --- Parallax Effect on Scroll ---
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');

        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }

        // Background Blur Effect
        const bg = document.getElementById('page-background');
        if (bg) {
            const blurAmount = Math.min(scrolled / 50, 10);
            bg.style.filter = `blur(${blurAmount}px)`;
        }
    });

    // --- Pixel Snow Effect (Canvas) ---
    function initPixelSnow() {
        const canvas = document.getElementById('pixel-snow-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.offsetWidth;
        let height = canvas.height = canvas.parentElement.offsetHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        });

        const particles = [];
        const particleCount = 100;

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * -height;
                this.speed = Math.random() * 1 + 0.2;
                this.size = Math.floor(Math.random() * 3) + 2;
                this.drift = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.3;
            }
            update() {
                this.y += this.speed;
                this.x += this.drift;
                if (this.y > height) this.reset();
                if (this.x > width) this.x = 0;
                if (this.x < 0) this.x = width;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
            }
        }

        for (let i = 0; i < particleCount; i++) {
            const p = new Particle();
            p.y = Math.random() * height;
            particles.push(p);
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    initPixelSnow();

    // ====================== SERVER STATUS (UPDATED) ======================
    const serverIp = 'bramayugam.qzz.io';
    const apiUrl = `https://api.mcstatus.io/v2/status/java/${serverIp}?query=false`;

    const statusDot = document.getElementById('status-dot-main');
    const statusText = document.getElementById('server-online-text');
    const playerCount = document.getElementById('player-count');
    const heroStatus = document.getElementById('hero-status');
    const playerListContainer = document.getElementById('player-list-container');
    const versionInfo = document.getElementById('version-info');

    async function fetchServerStatus() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();

            if (data.online) {
                // Main Status
                statusDot.className = 'pulse-dot online';
                statusText.innerText = 'Online';
                statusText.style.color = '#4cd137';
                playerCount.innerText = data.players.online || 0;

                // Hero Mini Status
                if (heroStatus) {
                    heroStatus.querySelector('.status-dot').className = 'status-dot online';
                    heroStatus.querySelector('.status-text').innerText = `${data.players.online || 0} Players Online`;
                }

                // Version
                if (versionInfo && data.version) {
                    versionInfo.innerText = `Version: ${data.version.name_clean || data.version.name || 'Unknown'}`;
                }

                // MOTD
                const motdContainer = document.getElementById('motd-container');
                const motdContent = document.getElementById('motd-content');
                if (motdContainer && motdContent) {
                    if (data.motd && (data.motd.html || data.motd.clean)) {
                        motdContainer.style.display = 'block';
                        let motdHtml = data.motd.html || (data.motd.clean || '').replace(/\n/g, '<br>');
                        motdContent.innerHTML = motdHtml;
                    } else {
                        motdContainer.style.display = 'none';
                    }
                }

                // Player Heads
                if (playerListContainer) {
                    playerListContainer.innerHTML = '';
                    if (data.players.list && data.players.list.length > 0) {
                        data.players.list.forEach(player => {
                            const img = document.createElement('img');
                            const name = player.name_clean || player.name;
                            img.src = `https://mc-heads.net/avatar/${name}/40`;
                            img.alt = name;
                            img.title = name;
                            img.className = 'player-head';
                            playerListContainer.appendChild(img);
                        });
                    } else {
                        playerListContainer.innerHTML = '<span style="color:#777; font-size: 0.9rem;">No players visible</span>';
                    }
                }
            } else {
                setOffline();
            }
        } catch (error) {
            console.error('Error fetching server status:', error);
            setOffline();
        }
    }

    function setOffline() {
        statusDot.className = 'pulse-dot offline';
        statusText.innerText = 'Offline';
        statusText.style.color = '#e84118';
        playerCount.innerText = '0';

        if (heroStatus) {
            heroStatus.querySelector('.status-dot').className = 'status-dot offline';
            heroStatus.querySelector('.status-text').innerText = 'Server Offline';
        }
    }

    // Fetch immediately and then every 30 seconds
    fetchServerStatus();
    setInterval(fetchServerStatus, 30000);

    // --- Active Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- 3D Tilt Effect for Cards ---
    function init3DTilt() {
        const cards = document.querySelectorAll('.feature-card, .rule-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }

    init3DTilt();
});

// ====================== COPY IP FUNCTION ======================
function copyIp(text, btnId, port = null) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const contentToCopy = text + (port ? ':' + port : '');
    const originalHTML = btn.innerHTML;
    const copyIcon = btn.querySelector('.copy-icon');

    navigator.clipboard.writeText(contentToCopy).then(() => {
        if (copyIcon) copyIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.style.borderColor = '#4cd137';

        setTimeout(() => {
            if (copyIcon) copyIcon.innerHTML = '<i class="fa-regular fa-copy"></i>';
            btn.style.borderColor = '';
        }, 2000);
    }).catch(() => {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = contentToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        if (copyIcon) copyIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.style.borderColor = '#4cd137';

        setTimeout(() => {
            if (copyIcon) copyIcon.innerHTML = '<i class="fa-regular fa-copy"></i>';
            btn.style.borderColor = '';
        }, 2000);
    });
}
