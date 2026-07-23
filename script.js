/**
 * LUXURY ENGAGEMENT INVITATION SCRIPT
 * Architecture: Vanilla JS + GSAP + Lenis + SplitType
 */

// 1. CONFIGURATION
const WHATSAPP_NUMBER = "491701234567"; // WICHTIG: Hier deine Nummer eintragen (ohne + oder 00)
const EVENT_DATE = "2026-11-15T18:00:00"; // Platzhalter-Datum für den Countdown

// 2. INITIALIZE LENIS (SMOOTH SCROLLING)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Edles Easing
    smooth: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Lenis und ScrollTrigger synchronisieren
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// Scrollen am Anfang stoppen, bis die Karte geöffnet wurde
lenis.stop(); 

// 3. ENVELOPE INTERACTION LOGIC
const envelopeWrapper = document.querySelector('.envelope-wrapper');
const waxSeal = document.querySelector('.wax-seal');
const flap = document.querySelector('.envelope-flap');
const card = document.querySelector('.invitation-card');
const tapHint = document.querySelector('.tap-hint');
const dragHint = document.querySelector('.drag-hint');

let isEnvelopeOpen = false;

// Klick auf den Umschlag -> Siegel bricht, Klappe öffnet sich
envelopeWrapper.addEventListener('click', () => {
    if (isEnvelopeOpen) return;
    isEnvelopeOpen = true;

    // Vibration (nur auf mobilen Geräten, die es unterstützen)
    if (navigator.vibrate) navigator.vibrate(50);

    const tl = gsap.timeline();

    // Tap hint ausblenden
    tl.to(tapHint, { opacity: 0, duration: 0.3 })
      // Siegel löst sich auf
      .to(waxSeal, { scale: 0, opacity: 0, duration: 0.6, ease: "back.in(1.5)" })
      // Klappe öffnet 3D
      .to(flap, { rotateX: 180, duration: 1.2, ease: "power3.inOut" }, "-=0.2")
      // Karte fährt 30% heraus (Wow Effekt)
      .to(card, { y: '-30%', duration: 1.5, ease: "power3.out" }, "-=0.4")
      // Drag Hint einblenden
      .to(dragHint, { opacity: 1, duration: 0.6 }, "-=0.5")
      // Callback: Dragging aktivieren
      .call(initDraggable);
});

// Drag-Logik (User muss die Karte hochziehen)
function initDraggable() {
    Draggable.create(card, {
        type: "y",
        bounds: { minY: -window.innerHeight, maxY: 0 },
        onDragStart: function() {
            gsap.to(dragHint, { opacity: 0, duration: 0.3 });
        },
        onDragEnd: function() {
            // Wenn der User die Karte weit genug hochzieht (Threshold)
            if (this.y < -120) {
                transitionToMainSite();
            } else {
                // Schnappt zurück auf 30%, wenn nicht stark genug gezogen
                gsap.to(card, { y: '-30%', duration: 0.6, ease: "back.out(1.2)" });
                gsap.to(dragHint, { opacity: 1, duration: 0.3, delay: 0.5 });
            }
        }
    });
}

// Übergang von der Umschlag-Szene zur Haupt-Website
function transitionToMainSite() {
    const tl = gsap.timeline({
        onComplete: () => {
            // Hero Screen verstecken, Main Content aktivieren
            document.getElementById('hero-screen').style.display = 'none';
            
            // Scrollen freigeben
            document.body.style.overflowY = 'auto';
            lenis.start();
            
            // ScrollTrigger Animationen initialisieren
            initScrollAnimations();
        }
    });

    // Karte fährt komplett raus und skaliert auf
    tl.to(card, { y: '-100vh', opacity: 0, duration: 1, ease: "power2.in" })
      // Umschlag fällt nach unten weg
      .to(envelopeWrapper, { y: '50vh', opacity: 0, duration: 1, ease: "power2.in" }, "<")
      // Main Content wird eingeblendet
      .to('#main-content', { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: "power2.out" }, "-=0.5");
}

// 4. TEXT & SCROLL ANIMATIONS (Premium Feel)
function initScrollAnimations() {
    // SplitType für buchstabenweise Animation des Titels
    const splitTitle = new SplitType('.split-text', { types: 'chars' });
    
    gsap.from(splitTitle.chars, {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: '.welcome-section',
            start: "top 80%"
        }
    });

    // Generische Fade-Up Animation für alle gekennzeichneten Elemente
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// 5. COUNTDOWN LOGIC
function initCountdown() {
    const targetDate = new Date(EVENT_DATE).getTime();

    const updateTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(updateTimer);
            return;
        }

        document.getElementById('cd-days').innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById('cd-hours').innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById('cd-minutes').innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById('cd-seconds').innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    }, 1000);
}
initCountdown();

// 6. WHATSAPP BUTTON LOGIC
document.getElementById('whatsapp-btn').addEventListener('click', () => {
    const text = encodeURIComponent("Hallo Gülnur und Yasin, wir kommen sehr gerne zu eurer Verlobung! 🤍");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
});
