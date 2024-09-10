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

function updateShop() {
  const statElement = document.getElementById('stats');
  statElement.textContent = `Farts: ${fartCount} | Unlocked: ${unlockedFarts}/10`;

  const fartList = document.getElementById('fartList');
  fartList.innerHTML = '';

  for (let i = 1; i <= 10; i++) {
    const li = document.createElement('li');
    li.className = 'fart-item';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = `Fart ${i} (${fartAnimations[i]})`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `fart${i}`;
    checkbox.checked = selectedFarts.includes(i);
    checkbox.disabled = i > unlockedFarts;
    checkbox.onchange = () => toggleFart(i);
    
    const button = document.createElement('button');
    if (i <= unlockedFarts) {
      button.textContent = 'Unlocked';
      button.disabled = true;
    } else {
      button.textContent = `Unlock (Cost: ${fartUnlockCosts[i]})`;
      button.onclick = () => unlockFart(i);
      button.disabled = fartCount < fartUnlockCosts[i];
    }
    
    li.appendChild(checkbox);
    li.appendChild(nameSpan);
    li.appendChild(button);
    fartList.appendChild(li);
  }
}

function toggleFart(fartNumber) {
  if (selectedFarts.includes(fartNumber)) {
    selectedFarts = selectedFarts.filter(f => f !== fartNumber);
  } else {
    selectedFarts.push(fartNumber);
  }
  chrome.storage.local.set({ selectedFarts }, updateShop);
}

function unlockFart(fartNumber) {
  if (fartCount >= fartUnlockCosts[fartNumber]) {
    fartCount -= fartUnlockCosts[fartNumber];
    unlockedFarts = Math.max(unlockedFarts, fartNumber);
    selectedFarts.push(fartNumber);
    chrome.storage.local.set({ fartCount, unlockedFarts, selectedFarts }, updateShop);
  }
}

// Make the shop window draggable
const shopHeader = document.getElementById('shopHeader');
let isDragging = false;
let startX, startY;

shopHeader.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX - window.screenX;
  startY = e.clientY - window.screenY;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    chrome.windows.getCurrent((window) => {
      chrome.windows.update(window.id, {
        left: e.screenX - startX,
        top: e.screenY - startY
      });
    });
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Initialize the shop
chrome.storage.local.get(['fartCount', 'unlockedFarts', 'selectedFarts'], (result) => {
  fartCount = result.fartCount || 0;
  unlockedFarts = result.unlockedFarts || 1;
  selectedFarts = result.selectedFarts || [1];
  updateShop();
});