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
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        // Simple parallax for hero content
        if (scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    });

    // --- Server Status API ---
    const serverIp = 'paid1.cherrynodes.site:25574';
    const apiUrl = `https://api.mcstatus.io/v2/status/java/${serverIp}`;

    const statusDot = document.getElementById('status-dot-main');
    const statusText = document.getElementById('server-online-text');
    const playerCount = document.getElementById('player-count');
    const heroStatus = document.getElementById('hero-status');
    const playerListContainer = document.getElementById('player-list-container');
    const versionInfo = document.getElementById('version-info');

    async function fetchServerStatus() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.online) {
                // Update Main Status
                statusDot.className = 'pulse-dot online';
                statusText.innerText = 'Online';
                statusText.style.color = '#4cd137';
                playerCount.innerText = data.players.online;
                
                // Update Hero Mini Status
                if (heroStatus) {
                    heroStatus.querySelector('.status-dot').className = 'status-dot online';
                    heroStatus.querySelector('.status-text').innerText = `${data.players.online} Players Online`;
                }

                // Update Version
                if (versionInfo) {
                    versionInfo.innerText = `Version: ${data.version.name_clean || data.version.name}`;
                }

                // Player List (Heads)
                if (playerListContainer && data.players.list && data.players.list.length > 0) {
                    playerListContainer.innerHTML = '';
                    data.players.list.forEach(player => {
                        const img = document.createElement('img');
                        // Use uuid for head if available, otherwise name
                        const avatarUrl = `https://mc-heads.net/avatar/${player.uuid || player.name}/40`;
                        img.src = avatarUrl;
                        img.alt = player.name_clean || player.name;
                        img.title = player.name_clean || player.name;
                        img.className = 'player-head';
                        playerListContainer.appendChild(img);
                    });
                } else {
                    playerListContainer.innerHTML = '<span style="color:#777; font-size: 0.9rem;">No players visible or list hidden.</span>';
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

        navLinks.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });
    });
});

// --- Copy IP Function ---
function copyIp() {
    const ip = 'paid1.cherrynodes.site:25574';
    const btn = document.getElementById('copy-btn');
    const originalText = btn.innerHTML;
    
    navigator.clipboard.writeText(ip).then(() => {
        btn.innerHTML = '<span class="btn-text">IP Copied!</span> <span class="btn-icon">✅</span>';
        btn.style.borderColor = '#4cd137';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = ip;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            btn.innerHTML = '<span class="btn-text">IP Copied!</span> <span class="btn-icon">✅</span>';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    });
}