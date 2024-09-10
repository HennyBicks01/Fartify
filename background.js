let fartCount = 0;
let unlockedFarts = 1;
let selectedFarts = [1];
const fartUnlockCosts = [0, 1, 2, 5, 1, 2, 3, 5, 8, 1];
const fartAnimations = {
  1: "default",
  2: "spiral",
  3: "explosion",
  4: "rainbow",
  5: "zigzag",
  6: "fountain",
  7: "vortex",
  8: "fireworks",
  9: "tornado",
  10: "galaxy"
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['fartCount', 'unlockedFarts', 'selectedFarts'], (result) => {
    fartCount = result.fartCount || 0;
    unlockedFarts = result.unlockedFarts || 1;
    selectedFarts = result.selectedFarts || [1];
    updateContextMenu();
  });
});

function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "fartStats",
      title: `Farts: ${fartCount} | Unlocked: ${unlockedFarts}/10`,
      contexts: ["action"]
    });

    chrome.contextMenus.create({
      id: "stinkShop",
      title: "Stink Shop",
      contexts: ["action"]
    });
  });
}

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "stinkShop") {
    chrome.windows.create({
      url: 'shop.html',
      type: 'popup',
      width: 400,
      height: 600
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(['selectedFarts'], (result) => {
    selectedFarts = result.selectedFarts || [1];
    if (selectedFarts.length > 0) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: injectFartScript,
        args: [selectedFarts, fartAnimations]
      });
      fartCount++;
      chrome.storage.local.set({ fartCount });
      updateContextMenu();
    }
  });
});

function injectFartScript(selectedFarts, fartAnimations) {
  function playRandomFartSound() {
    const fartNumber = selectedFarts[Math.floor(Math.random() * selectedFarts.length)];
    const audioUrl = chrome.runtime.getURL(`trimmed_farts/fart${fartNumber}.mp3`);
    
    const audio = new Audio();
    audio.src = audioUrl;
    
    audio.oncanplaythrough = function() {
      audio.play().catch(e => console.error("Error playing audio:", e));
    };
    
    audio.onerror = function() {
      console.error("Error loading audio:", audio.error);
    };

    return fartNumber;
  }

  function createParticleEffect(fartNumber) {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];

    class Particle {
      constructor() {
        this.x = canvas.width - Math.random() * 100;
        this.y = Math.random() * 100;
        this.size = Math.random() * 8 + 2;
        
        const angle = Math.PI / 16 + (Math.random() * Math.PI / 3);
        const speed = Math.random() * 15 + 5;
        this.speedX = -Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        
        this.life = 3000 + Math.random() * 2000;
        this.initialLife = this.life;
        this.color = `hsl(${Math.random() * 40 + 90}, 100%, ${Math.random() * 30 + 40}%)`;
        this.dragCoefficient = 0.02 + Math.random() * 0.03;
      }

      update() {
        this.speedX *= (1 - this.dragCoefficient);
        this.speedY *= (1 - this.dragCoefficient);

        this.x += this.speedX;
        this.y += this.speedY;
        
        this.life -= 1;
        if (this.size > 0.2) this.size -= 0.005;
      }

      draw() {
        const opacity = Math.min(1, this.life / this.initialLife);
        ctx.fillStyle = this.color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function createParticles() {
      for (let i = 0; i < 500; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0 || 
            (Math.abs(particle.speedX) < 0.1 && Math.abs(particle.speedY) < 0.1)) {
          particles.splice(index, 1);
        }
      });
      if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
      } else {
        document.body.removeChild(canvas);
      }
    }

    function applyAnimation(animationType) {
      switch (animationType) {
        case "default":
          break;
        case "spiral":
          particles.forEach((p, i) => {
            const angle = i * 0.1;
            p.speedX += Math.cos(angle) * 0.5;
            p.speedY += Math.sin(angle) * 0.5;
          });
          break;
        case "explosion":
          particles.forEach(p => {
            const speed = Math.random() * 3 + 1;
            p.speedX *= speed;
            p.speedY *= speed;
          });
          break;
        case "rainbow":
          particles.forEach((p, i) => {
            p.color = `hsl(${i * 360 / particles.length}, 100%, 50%)`;
          });
          break;
        case "zigzag":
          particles.forEach((p, i) => {
            p.speedX += Math.sin(i * 0.1) * 2;
          });
          break;
        case "fountain":
          particles.forEach(p => {
            p.speedY -= 2;
            p.dragCoefficient *= 0.8;
          });
          break;
        case "vortex":
          particles.forEach((p, i) => {
            const angle = Math.atan2(p.speedY, p.speedX);
            const speed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
            p.speedX = Math.cos(angle + 0.1) * speed;
            p.speedY = Math.sin(angle + 0.1) * speed;
          });
          break;
        case "fireworks":
          particles.forEach(p => {
            if (Math.random() < 0.05) {
              p.speedX *= -0.5;
              p.speedY *= -0.5;
              p.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            }
          });
          break;
        case "tornado":
          particles.forEach((p, i) => {
            const angle = i * 0.01;
            p.speedX += Math.cos(angle) * 0.2;
            p.speedY += Math.sin(angle) * 0.2;
          });
          break;
        case "galaxy":
          particles.forEach((p, i) => {
            const angle = i * 0.05;
            const distance = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
            p.speedX += (Math.cos(angle) * distance - p.speedX) * 0.05;
            p.speedY += (Math.sin(angle) * distance - p.speedY) * 0.05;
            p.color = `hsl(${i * 360 / particles.length}, 100%, ${50 + Math.sin(i * 0.1) * 20}%)`;
          });
          break;
      }
    }

    createParticles();
    applyAnimation(fartAnimations[fartNumber]);
    animateParticles();
  }

  const fartNumber = playRandomFartSound();
  createParticleEffect(fartNumber);
}