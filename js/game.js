// Global variables
let gameEnded = false;
let lightningInterval = null;
const totalOptions = 6;
let capturedCount = 0;
let showingBack = false;
const statusMessages = {
    "200": "🟢 All good. 200 is back to the realm of eternal victories.",
    "301": "🔁 Farewell... 301 returns to the universe of endless reroutes.",
    "302": "⏩ 302 appeared for a moment… but was no longer there.",
    "403": "⛔ 403 heading back to the land of client mistakes. Forbidden, as always.",
    "404": "❓ 404 looked everywhere… but nothing was where it was supposed to be",
    "500": "💥 500 vanished in smoke... back to the chaos of crashing servers."
};

// DOM elements
const trap = document.getElementById('trap');
const panel = document.getElementById('statusPanel');
let isOpen = false;
let isProcessing = false; // flag to prevent multiple drops

document.addEventListener('DOMContentLoaded', () => {

    setInterval(() => {
      const el = document.querySelector('.game-here');
      if (el) {
        el.classList.add('wobble');
        setTimeout(() => {
          el.classList.remove('wobble');
        }, 600); // duração da animação (ajuste conforme seu CSS)
      }
    }, 5000);

    const playGameText = document.getElementById('text-play');
    if (window.innerWidth > 800) {
      playGameText.textContent = 'Click to play';
    } else {
      playGameText.textContent = 'Tap to play';
    }

  // Elementos principais
  const elPlay = document.getElementById('play-game');
  const game2 = document.getElementById('game-2');
  const aboutBtn = document.querySelector('.about-game');
  const modal = document.getElementById('aboutModal');
  const trap = document.getElementById('trap');
  const panel = document.getElementById('statusPanel');

  // Inicia universo
  initializeUniverse();

  // Botão da TRAP
  trap.addEventListener('click', () => {
    if (isOpen || gameEnded) return;
    trap.classList.add('open');
    panel.style.display = 'block';
    isOpen = true;
    enableDragDrop();
  });

  // Botão "Practice here"
  if (elPlay && game2) {
    elPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      game2.style.display = 'block';
    });
  }

  // Botão "About game"
  if (aboutBtn && modal) {
    aboutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      modal.style.display = 'flex';
    });
  }

  // Botão "Restart"
  document.getElementById("restartGame").addEventListener("click", () => {
    location.reload();
  });

  // Botões das cartas
  document.querySelectorAll('.status-code-card').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.id;
      const code = id.replace('about-', '');
      const imagePath = `images/card-${code}.webp`;
      document.getElementById('cardImage').src = imagePath;
      document.getElementById('cardModal').style.display = 'flex';

      const backText = {
          "200": "<strong>200</strong><br><span>OK</span><br>Everything went perfectly. ✅<br>Success without surprises.",
          "301": "<strong>301</strong><br><span>Moved Permanently</span><br>This resource has moved forever.<br>Update your links!",
          "302": "<strong>302</strong><br><span>Found</span><br>Temporary detour.<br>Destination changed.",
          "403": "<strong>403</strong><br><span>Forbidden</span><br>Access denied. 🚫<br>You shall not pass!",
          "404": "<strong>404</strong><br><span>Not Found</span><br>The void is empty...<br>No resource found.",
          "500": "<strong>500</strong><br><span>Internal Server Error</span><br>Something broke inside.<br>Try again later..."
        };


      const cardBackEl = document.getElementById('cardBack');
const cardBackTextEl = document.getElementById('cardBackText');

// Define o conteúdo do verso
cardBackTextEl.innerHTML = backText[code] || "<strong>???</strong><br><span>Unknown</span><br>Status code.";

// Define a classe visual da carta correspondente (ex: card-404)
cardBackEl.className = 'card-back card-' + code;


    });
  });

  // Flip logic
const flipContainer = document.getElementById('flipContainer');

if (flipContainer) {
  flipContainer.addEventListener('click', () => {
    const flipSound = document.getElementById("flipSound");
    flipSound.currentTime = 0;
    flipSound.play().catch(() => {});
    flipContainer.classList.toggle('flipped');
    showingBack = !showingBack;
  });
}



  // Fechar modal da carta
  document.getElementById('cardModal').querySelector('button').addEventListener('click', closeCardModal);

  // ESC fecha os modais
  document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      closeAboutModal();
      closeCardModal();
    }
  });
});


// Game functions
function startGame() {
    document.getElementById("retroConsole").style.display = 'block';
    document.getElementById("retroConsole").innerHTML = '';
    document.querySelector(".container").style.display = "none";
    document.getElementById("audioControls").style.display = "block";

    const groupGame = document.querySelector(".group-game");
    groupGame.style.display = "flex";
    requestAnimationFrame(() => {
        groupGame.classList.add("fade-in");
    });

    const bgMusic = document.getElementById("bgMusic");
    bgMusic.volume = 0.4;
    if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
    }

    // Preload sounds
    document.getElementById("sound200").play().catch(() => {});
    document.getElementById("sound200").pause();

    trap.classList.add('open');
    panel.classList.add('visible');
    isOpen = true;
    enableDragDrop();
}

function toggleAudio() {
    const bgMusic = document.getElementById("bgMusic");
    const audioBtn = document.querySelector("#audioControls button");
    if (bgMusic.paused) {
        bgMusic.play();
        audioBtn.textContent = "🔊";
    } else {
        bgMusic.pause();
        audioBtn.textContent = "🔇";
    }
}

function closeCardModal() {
    document.getElementById('cardModal').style.display = 'none';
    flipContainer.classList.remove('flipped');
}

function closeAboutModal() {
    document.getElementById('aboutModal').style.display = 'none';
}

function showDialog(message) {
    const dialog = document.getElementById('dialogBox');
    dialog.textContent = message;
    dialog.style.display = 'block';
    dialog.style.opacity = '0';
    dialog.style.transition = 'opacity 0.3s ease-in-out';
    setTimeout(() => { dialog.style.opacity = '1'; }, 10);

    setTimeout(() => {
        dialog.style.opacity = '0';
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 300);
    }, 5000);
}

function enableDragDrop() {
    $(".trap").droppable({
        accept: ".status-option",
        drop: function(event, ui) {
            if (isProcessing) {
                $(".trap").addClass("blocked");

                const waitSound = document.getElementById("waitSound");
                waitSound.currentTime = 0;
                waitSound.play().catch(() => {});

                setTimeout(() => $(".trap").removeClass("blocked"), 1000);
                return;
            }

            if (!ui.helper || !ui.helper.hasClass("ui-draggable-dragging")) return;

            isProcessing = true;

            const original = ui.helper.data("originalElement");
            const code = original.data("code");
            const consoleBox = document.getElementById("retroConsole");

            ui.helper.data("droppedInTrap", true);
            const border = document.querySelector(".trap-border");
            border.classList.add("active");
            triggerExplosion();

            trap.classList.remove('open');
            trap.classList.remove('open-mobile');

            setTimeout(() => {
                if (!gameEnded) {
                    trap.classList.add('open');

                    const trapOpenSound = document.getElementById("trapOpenSound");
                    trapOpenSound.currentTime = 0;
                    trapOpenSound.play().catch(() => {});
                }
            }, 6000);

            const bubble = document.getElementById("bubbleSound");
            bubble.pause();
            bubble.currentTime = 0;
            bubble.play().catch(() => {});

            const sendingLine = document.createElement("div");
            sendingLine.textContent = `> Sending request [${code}]...`;
            consoleBox.appendChild(sendingLine);
            consoleBox.scrollTop = consoleBox.scrollHeight;

            setTimeout(() => {
                const icon = "✅"; // sucesso
                const successLine = document.createElement("div");
                successLine.textContent = `${icon} Request succeeded.`;
                consoleBox.appendChild(successLine);
                consoleBox.scrollTop = consoleBox.scrollHeight;

                const soundId = `sound${code}`;
                const audio = document.getElementById(soundId);
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch(() => {});
                    const message = statusMessages[code] || `🔊 Tocando áudio do status ${code}`;
                    showDialog(message);
                }

                if (++capturedCount >= totalOptions) {
                    setTimeout(() => {
                        trap.classList.remove('open');
                        const trapCloseSound = document.getElementById("trapCloseSound");
                        trap.classList.add('open-mobile');
                        trapCloseSound.currentTime = 0;
                        trapCloseSound.play().catch(() => {});
                        panel.classList.remove('visible');
                        isOpen = false;
                        document.getElementById("endMessage").style.display = "block";
                        setTimeout(() => {
                            const thanksSound = document.getElementById("thanksSound");
                            thanksSound.currentTime = 0;
                            thanksSound.play().catch(() => {});
                            document.getElementById("restartGame").style.display = "block";
                        }, 2500);

                        const bgMusic = document.getElementById("bgMusic");
                        gameEnded = true;
                        let fadeOutInterval = setInterval(() => {
                            if (bgMusic.volume > 0.01) {
                                bgMusic.volume -= 0.01;
                            } else {
                                clearInterval(fadeOutInterval);
                                bgMusic.pause();
                                bgMusic.currentTime = 0;
                                bgMusic.volume = 0.4;
                            }
                        }, 50);

                        isProcessing = false;
                    }, bubble.duration * 1000 || 1000);
                } else {
                    isProcessing = false;
                }

            }, bubble.duration * 1000 || 1000);

            const bottomTrap = document.querySelector('.bottom-trap');
            bottomTrap.classList.add('wobble');
            setTimeout(() => bottomTrap.classList.remove('wobble'), 6000);
            setTimeout(() => border.classList.remove("active"), 2000);

            if (original && original.length) {
                const placeholder = $('<div class="status-option empty"></div>');
                original.replaceWith(placeholder);
            }
        }
    });

    $(".status-option").draggable({
        revert: "invalid",
        helper: function() {
            const original = $(this);
            const clone = original.clone();
            if (original.find(".mask").length) {
                clone.find(".mask").remove();
                const mask = $('<div class="mask"></div>');
                clone.prepend(mask);
            }
            clone.addClass("glow");
            return clone;
        },
        zIndex: 10000,
        start: function(event, ui) {
            const original = $(this);
            const code = original.data("code");
            const consoleBox = document.getElementById("retroConsole");

            const icon = "⏳";
            const line = document.createElement("div");
            line.textContent = `${icon} Preparing request [${code}]...`;
            consoleBox.appendChild(line);
            consoleBox.scrollTop = consoleBox.scrollHeight;

            ui.helper.data("originalElement", original);
            original.css("visibility", "hidden");
            ui.helper.find(".mask").css("opacity", "1");

            const sound = document.getElementById("electricitySound");
            sound.currentTime = 0;
            sound.loop = true;
            sound.play().catch(() => {});

            lightningInterval = setInterval(() => {
                ui.helper.find(".mask").each(function() {
                    const currentBg = $(this).css("background-image");
                    const isFirst = currentBg.includes("mask-1.webp");
                    $(this).css("background-image", `url(${isFirst ? 'images/mask-2.webp' : 'images/mask-1.webp'})`);
                });
            }, 120);
        },
        stop: function(event, ui) {
            $(".mask").css("opacity", "0");
            const sound = document.getElementById("electricitySound");
            sound.pause();
            sound.currentTime = 0;
            clearInterval(lightningInterval);
            lightningInterval = null;
            $(".mask").css("background-image", 'url("images/mask-1.webp")');

            if (!ui.helper.data("droppedInTrap")) {
                const original = ui.helper.data("originalElement");
                if (original) {
                    original.css("visibility", "visible");
                    original.addClass("shake");
                    setTimeout(() => original.removeClass("shake"), 400);

                    const code = original.data("code");
                    const consoleBox = document.getElementById("retroConsole");
                    const icon = "⚠️"; // ícone para abortado
                    const line = document.createElement("div");
                    line.textContent = `${icon} Request [${code}] aborted.`;
                    consoleBox.appendChild(line);
                    consoleBox.scrollTop = consoleBox.scrollHeight;
                }
            }

        }
    });
}

function triggerExplosion() {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = 10000;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.background = '#ff3d00';
        particle.style.borderRadius = '50%';
        particle.style.top = '0';
        particle.style.left = '0';
        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 60;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        particle.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out',
            fill: 'forwards'
        });
        container.appendChild(particle);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 700);
}

function initializeUniverse() {
    const universe = document.getElementById('universe');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Create stars
    for (let i = 0; i < 200; i++) {
        createStar();
    }

    // Create shooting stars
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createShootingStar();
        }, i * 3000);
    }

    // Create nebulas
    for (let i = 0; i < 5; i++) {
        createNebula();
    }

    function checkOrientation() {
      const rotateMessage = document.getElementById('rotateMessage');
      const isMobile = window.innerWidth <= 768;

      if (isMobile && window.matchMedia("(orientation: landscape)").matches) {
        rotateMessage.style.display = "flex";
      } else {
        rotateMessage.style.display = "none";
      }
    }

    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    // Chamada inicial
    checkOrientation();

    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random position
        const x = Math.random() * windowWidth;
        const y = Math.random() * windowHeight;

        // Random size (small)
        const size = Math.random() * 2 + 1;

        // Random animation duration
        const duration = Math.random() * 3 + 2 + 's';

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', duration);

        universe.appendChild(star);
    }

    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');

        // Random initial position (usually at the top of the screen)
        const x = Math.random() * windowWidth;
        const y = Math.random() * (windowHeight / 3);

        // Distance and direction of movement
        const distanceX = (Math.random() - 0.5) * windowWidth;
        const distanceY = Math.random() * windowHeight / 2;

        // Animation duration
        const duration = Math.random() * 2 + 1 + 's';

        shootingStar.style.left = `${x}px`;
        shootingStar.style.top = `${y}px`;
        shootingStar.style.setProperty('--distance-x', `${distanceX}px`);
        shootingStar.style.setProperty('--distance-y', `${distanceY}px`);
        shootingStar.style.setProperty('--duration', duration);

        universe.appendChild(shootingStar);

        // Remove after animation
        setTimeout(() => {
            shootingStar.remove();
            createShootingStar();
        }, parseFloat(duration) * 1000);
    }

    function createNebula() {
        const nebula = document.createElement('div');
        nebula.classList.add('nebula');

        // Random position
        const x = Math.random() * windowWidth;
        const y = Math.random() * windowHeight;

        // Random size
        const size = Math.random() * 200 + 100;

        // Random color (shades of blue, purple and pink)
        const hue = Math.random() * 60 + 220;
        const color = `hsla(${hue}, 100%, 50%, 0.2)`;

        nebula.style.left = `${x}px`;
        nebula.style.top = `${y}px`;
        nebula.style.width = `${size}px`;
        nebula.style.height = `${size}px`;
        nebula.style.backgroundColor = color;

        universe.appendChild(nebula);
    }

    // Add more stars when resizing the window
    window.addEventListener('resize', function() {
        const newWindowWidth = window.innerWidth;
        const newWindowHeight = window.innerHeight;

        // Clear and recreate stars if the window is resized significantly
        if (Math.abs(newWindowWidth - windowWidth) > 200 || Math.abs(newWindowHeight - windowHeight) > 200) {
            universe.innerHTML = '';

            for (let i = 0; i < 200; i++) {
                createStar();
            }

            for (let i = 0; i < 5; i++) {
                createNebula();
            }

            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createShootingStar();
                }, i * 1000);
            }
        }
    });

}