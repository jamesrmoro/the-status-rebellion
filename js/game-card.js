// HTTP Status Match Game
document.addEventListener('DOMContentLoaded', function () {
  const instructionsEl = document.getElementById('instructions');
  const gameAreaEl = document.getElementById('game-area');
  const startGameBtn = document.getElementById('start-game-card');
  const submitAnswerBtn = document.getElementById('submit-answer');
  const skipQuestionBtn = document.getElementById('skip-question');
  const statusDescriptionEl = document.getElementById('status-description');
  const statusCardsEl = document.getElementById('status-cards');
  const scoreEl = document.getElementById('score');
  const feedbackOverlayEl = document.getElementById('feedback-overlay');
  const feedbackTextEl = document.getElementById('feedback-text');
  const feedbackDescriptionEl = document.getElementById('feedback-description');
  const continueButtonEl = document.getElementById('continue-button');
  const gameOverEl = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const masteredCountEl = document.getElementById('mastered-count');
  const playAgainBtn = document.getElementById('play-again');
  const flipSound = document.getElementById('flipSound');
  const correctSound = document.getElementById('correct-sound');
  const wrongSound = document.getElementById('wrong-sound');
  const skipSound = document.getElementById('skip-sound');
  const lifeLostSound = document.getElementById('lifeLostSound');
  const gameOverSound = document.getElementById('gameOverSound');

  let score = 0;
  let lives = 3;
  let currentQuestion = null;
  let selectedCardIndex = null;
  let swiper = null;
  let audioEnabled = true;
  let masteredStatuses = new Set();
  let currentStatusSlides = [];
  let wasWrongAnswer = false;
  let removedStatusCodes = new Set();

  const httpStatuses = [
  {
    code: "100",
    name: "Continue",
    description: "The server has received the request headers and the client should proceed to send the request body.",
    class: "status-1xx"
  },
  {
    code: "200",
    name: "OK",
    description: "The request has succeeded.",
    class: "status-2xx"
  },
  {
    code: "201",
    name: "Created",
    description: "A new resource was successfully created.",
    class: "status-2xx"
  },
  {
    code: "204",
    name: "No Content",
    description: "The server successfully processed the request but is not returning any content.",
    class: "status-2xx"
  },
  {
    code: "301",
    name: "Moved Permanently",
    description: "The resource has been permanently moved to a new URL.",
    class: "status-3xx"
  },
  {
    code: "302",
    name: "Found",
    description: "The resource temporarily resides under a different URL.",
    class: "status-3xx"
  },
  {
    code: "304",
    name: "Not Modified",
    description: "The resource has not changed since the last request.",
    class: "status-3xx"
  },
  {
    code: "400",
    name: "Bad Request",
    description: "The server could not understand the request due to invalid syntax.",
    class: "status-4xx"
  },
  {
    code: "401",
    name: "Unauthorized",
    description: "Authentication is required and has failed or has not yet been provided.",
    class: "status-4xx"
  },
  {
    code: "403",
    name: "Forbidden",
    description: "The server understands the request but refuses to authorize it.",
    class: "status-4xx"
  },
  {
    code: "404",
    name: "Not Found",
    description: "The server can not find the requested resource.",
    class: "status-4xx"
  },
  {
    code: "500",
    name: "Internal Server Error",
    description: "The server encountered an error and could not complete the request.",
    class: "status-5xx"
  },
  {
    code: "502",
    name: "Bad Gateway",
    description: "The server received an invalid response from the upstream server.",
    class: "status-5xx"
  },
  {
    code: "503",
    name: "Service Unavailable",
    description: "The server is not ready to handle the request.",
    class: "status-5xx"
  }
];


  function updateLivesDisplay() {
    const container = document.getElementById('livesContainer');
    const hearts = container.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
      heart.src = index < lives ? 'images/heart-full.webp' : 'images/heart-empty.webp';
    });
  }

  function initGame() {
    startGameBtn.addEventListener('click', startGameCard);
    submitAnswerBtn.addEventListener('click', checkAnswer);
    skipQuestionBtn.addEventListener('click', skipQuestion);
    continueButtonEl.addEventListener('click', continueGame);
    playAgainBtn.addEventListener('click', resetGame);
  }

  function startGameCard() {
    instructionsEl.style.display = 'none';
    gameAreaEl.style.display = 'flex';
    initSwiper();
    updateLivesDisplay();
    nextQuestion();
  }

  function initSwiper() {
    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }

    statusCardsEl.innerHTML = '';
    currentStatusSlides = [...httpStatuses];

    currentStatusSlides.forEach(status => {
      const slide = document.createElement('div');
      slide.className = `swiper-slide ${status.class}`;
      slide.setAttribute('data-code', status.code);
      slide.innerHTML = `<div class="status-code">${status.code}</div><div class="status-name">${status.name}</div>`;
      statusCardsEl.appendChild(slide);
    });


swiper = new Swiper('.swiper-container', {
  effect: 'cards',
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  loop: false,
  keyboard: {
    enabled: true,
    onlyInViewport: true
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  on: {
    slideChange: function () {
      if (!swiper || swiper.realIndex == null) return;

      selectedCardIndex = swiper.realIndex;
      document.querySelectorAll('.swiper-slide').forEach(slide =>
        slide.classList.remove('selected')
      );
      const activeSlide = document.querySelector('.swiper-slide-active');
      if (activeSlide) activeSlide.classList.add('selected');

      if (audioEnabled && flipSound) {
        flipSound.currentTime = 0;
        flipSound.play().catch(() => {});
      }
    }
  }
});


document.addEventListener('keydown', function (e) {
  if (!swiper) return;

  if (e.key === 'ArrowRight') {
    swiper.slideNext();
  } else if (e.key === 'ArrowLeft') {
    swiper.slidePrev();
  }
});

  }

  function nextQuestion() {
    const available = currentStatusSlides.filter(s => !masteredStatuses.has(s.code) && !removedStatusCodes.has(s.code));
    if (available.length === 0 || lives <= 0) {
      endGame();
      return;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    currentQuestion = available[randomIndex];
    statusDescriptionEl.textContent = currentQuestion.description;
  }

  function checkAnswer() {
    const index = swiper.realIndex;
    if (index == null) return;
    const selectedStatus = currentStatusSlides[index];
    const isCorrect = selectedStatus.code === currentQuestion.code;
    const descriptionCard = document.querySelector('.description-card');
    const currentSlide = document.querySelector(`.swiper-slide[data-code="${currentQuestion.code}"]`);

    if (isCorrect) {
      wasWrongAnswer = false;
      masteredStatuses.add(currentQuestion.code);
      removedStatusCodes.add(currentQuestion.code);
      score += 10;
      scoreEl.textContent = score;
      showFeedback(true, `That's right! HTTP ${currentQuestion.code} is "${currentQuestion.name}".`);
      if (audioEnabled) correctSound.play().catch(() => {});
      if (currentSlide) currentSlide.classList.add('disabled-slide');
    } else {
      wasWrongAnswer = true;
      showFeedback(false, `Incorrect. The correct answer was HTTP ${currentQuestion.code} - ${currentQuestion.name}.`);
      if (audioEnabled) wrongSound.play().catch(() => {});
    }

    setTimeout(() => {
      descriptionCard.classList.add('wobble');
      setTimeout(() => descriptionCard.classList.remove('wobble'), 600);
    }, 1500);
  }

  function skipQuestion() {
    continueGame();
    if (audioEnabled) skipSound.play().catch(() => {});
  }

  function showFeedback(isCorrect, message) {
    feedbackTextEl.textContent = isCorrect ? 'Correct!' : 'Incorrect';
    feedbackTextEl.className = isCorrect ? 'correct' : 'wrong';
    feedbackDescriptionEl.textContent = message;
    feedbackOverlayEl.classList.add('active');
  }

  function continueGame() {
    feedbackOverlayEl.classList.remove('active');
    if (wasWrongAnswer) {
      setTimeout(() => {
        lives--;
        updateLivesDisplay();
        if (audioEnabled) lifeLostSound.play().catch(() => {});
        wasWrongAnswer = false;
        if (lives <= 0 || masteredStatuses.size >= httpStatuses.length) endGame();
        else nextQuestion();
      }, 500);
    } else {
      nextQuestion();
    }
  }

  function endGame() {
    finalScoreEl.textContent = score;
    masteredCountEl.textContent = masteredStatuses.size;
    gameOverEl.classList.add('active');
    if (audioEnabled) gameOverSound.play().catch(() => {});
  }

  function resetGame() {
    score = 0;
    lives = 3;
    currentQuestion = null;
    selectedCardIndex = null;
    masteredStatuses = new Set();
    removedStatusCodes = new Set();
    updateLivesDisplay();
    scoreEl.textContent = score;
    gameOverEl.classList.remove('active');
    startGameCard();
  }

  function toggleAudio() {
    audioEnabled = !audioEnabled;
  }

  initGame();

  const buttonCloseModalCard = document.getElementById('buttonCloseModalCard');
  const trapCloseModal = document.getElementById('trapCloseModal');
  buttonCloseModalCard.addEventListener('click', () => {
    document.getElementById('game-2').style.display = 'none';
    if (trapCloseModal && audioEnabled) {
      trapCloseModal.currentTime = 0;
      trapCloseModal.play().catch(() => {});
    }
  });
});
