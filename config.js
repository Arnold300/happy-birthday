/* =========================================================================
   CONFIG — everything you'll actually want to edit lives in this one file.
   Nothing here needs to touch the HTML, CSS, or the game logic in script.js.
   ========================================================================= */

const CONFIG = {

  // ---------------------------------------------------------------------
  // 1) SECRET PIN
  // The PIN is never stored as plain text in the code — only a SHA-256
  // hash of it is. That way, someone poking around the file in devtools
  // sees a random-looking string, not the actual PIN.
  //
  // To set your PIN:
  //   1. Open generate-pin-hash.html in your browser (double click it)
  //   2. Type your PIN, copy the hash it gives you
  //   3. Paste it below as pinHash
  //
  // The default below is the hash for "0000" — CHANGE THIS.
  // ---------------------------------------------------------------------
  pinHash: "29c692dfebf9c23c058846444cdb260d242c7de4f05a143e7670264bd5537216",
  pinLength: 6, // change to match however many digits your PIN has
  pinHint: "the confession", // shown under the PIN pad, or set to "" to hide

  // Shown right after she enters the correct PIN, before the fireworks play.
  // She has to tap the button to continue — nothing happens automatically.
  pinSuccessHeadline: "You've successfully entered the right PIN!",
  pinSuccessButtonLabel: "Would you love to see what's next??",
  // How long the fireworks burst for after she taps through, before the
  // collage/teaser screen appears. In milliseconds (6000 = 6 seconds).
  pinFireworksDurationMs: 6000,

  // When she enters the wrong PIN, one of these floats up and fades over
  // ~3 seconds before resetting. "photo" is optional — path to an image
  // in /photos to show alongside the text. Leave it out for text-only.
  pinWrongTeases: [
    { text: "so sad 😔" },
    { text: "ahh you can do better" },
    { text: "nope, try again" },
    { text: "not even close" },
    { text: "the vault remains sealed" },
    // { text: "remember this?", photo: "photos/funny1.jpg" },
  ],

  // ---------------------------------------------------------------------
  // 3.5) THE TEASER — shown right after the PIN unlocks (post-fireworks),
  // before the quiz/sudoku game. Shows your finished collage photo full-size
  // while the mashup plays, then a button leads into the game.
  // ---------------------------------------------------------------------
  teaserCollageImage: "photos/collage.jpg", // your own finished collage image
  teaserText: "we're not done yet — you've got to play this game and win before we reveal your actual birthday card",

  // Let the fireworks settle first, then fade the prompt in gently a few
  // seconds later so it doesn't sit on top of the burst. 8000ms keeps the
  // action feeling clear and unblocked.
  teaserPromptDelayMs: 8000,
  teaserPromptText: "Would you fancy a round of fun and rapid questions?",

  // Background mashup audio. Put your exported MP3 in /audio and point this
  // at the filename. Starts playing (looped, faded) the instant she taps
  // through after the PIN, and keeps playing through the teaser, quiz, and
  // sudoku screens. Leave audioSrc as "" to disable audio entirely.
  audioSrc: "audio/mashup.mp3",
  audioVolume: 0.32, // 0 (silent) to 1 (full volume) — kept low/faded by default

  // ---------------------------------------------------------------------
  // 4) FUN QUESTIONS — open-ended, no right/wrong answers/grading either
  // way. At the end she sees all her answers on a summary screen
  // (screenshot-friendly) before moving into the sudoku.
  //
  // Two formats per question:
  //   { question: "..." }                          -> she types her own answer
  //   { question: "...", options: ["A","B","C"] }   -> she picks one of yours
  //
  // Each question can also have an optional "image" field — a path to a
  // photo in /photos, shown above the question. Mix and match freely —
  // some questions can have options, others can be free text.
  // ---------------------------------------------------------------------
  quiz: [
    {
      question: "Why do you think you could survive a zombie apocalypse?",
      options: ["You will walk like a zombie", "Your mom won't send you outside", "You will tell the zombies they're breaking a law", "You can laugh like a zombie"],
    },
    {
      question: "Which drink do you think you will never say no to?",
      options: ["Milk", "Lassi", "Limbu paani", "Cold drink"],
    },
    {
      question: "If you would want one dish to eat for life, what would it be?",
    },
    {
      question: "Where would people find you if you were lost in a huge supermarket?",
      options: ["The snack aisle", "At the exit cause you have to be home", "Dairy section", "Bhaji section"],
    },
    {
      question: "Which outfit are you most likely to wear?",
      options: ["A dress", "A 15-year-old t-shirt and shorts", "Kim's clothes", "Clothes from Sahkari Bhandar"],
    },
    {
      question: "Where is a great place to work according to you?",
    },
    {
      question: "Why do you think you wouldn't survive the war?",
      options: ["You will argue with the enemies about the environment getting bad", "Your mom won't send you", "You have a lot of work to do at home", "You're probably sleepy"],
    },
    {
      question: "Which is your most favourite meal?",
      options: ["Your mom's chai", "Your mom's pumpkin curry", "Lotus root", "Dal rice"],
      allowOther: true, // adds an "Other" button so she can type her own instead
    },
    {
      question: "What do you think you value the most — your friends or your 3-month-old, 10 rs water bottle in your bag?",
    },
  ],

  // Shown after all questions — her own answers displayed back to her.
  qaSummaryHeadline: "Here's what you said",
  qaSummaryButtonLabel: "Continue",

  // ---------------------------------------------------------------------
  // 4.5) RAPID FIRE ROUND — after the 4 basic questions, a fast-paced
  // bonus round: a food photo appears, she taps the date she thinks it's
  // from, and it auto-advances to the next photo (no "Next" click needed —
  // that's what makes it feel "rapid"). Add as many items as you want.
  // ---------------------------------------------------------------------
  rapidFireIntro: "bonus round: guess the date from the food pic! ready?",
  rapidFireStartLabel: "start",
  rapidFireAutoAdvanceMs: 1100, // how long the reaction shows before the next photo
  rapidFireRound: [
    {
      image: "photos/food1.jpg", // put your food photos in /photos
      question: "What date is this from?",
      options: ["June 2021", "Dec 2021", "March 2022", "Aug 2022"],
      answer: "Dec 2021", // must exactly match one option
    },
    {
      image: "photos/food2.jpg",
      question: "And this one?",
      options: ["Jan 2022", "May 2022", "Sept 2022", "Nov 2022"],
      answer: "Sept 2022",
    },
    {
      image: "photos/food3.jpg",
      question: "This one?",
      options: ["Feb 2023", "July 2023", "Oct 2023", "Dec 2023"],
      answer: "July 2023",
    },
    {
      image: "photos/food4.jpg",
      question: "Last one!",
      options: ["Jan 2024", "April 2024", "June 2024", "Aug 2024"],
      answer: "April 2024",
    },
  ],

  // ---------------------------------------------------------------------
  // 3) SUDOKU — a 6x6 grid where the "numbers" are 6 of her photos instead
  // of digits. Tapping an empty cell cycles through the 6 photos (tap
  // again to cycle to the next, cycles back to blank after the 6th). Fill
  // in exactly 6 photo paths below — order doesn't matter, each one just
  // becomes one of the 6 "symbols" used across the puzzle.
  // Teasing pop-ups appear automatically the longer she takes.
  // "afterSeconds" is how long she's been on the puzzle before that
  // particular tease can show up. Add, remove, or edit freely.
  // ---------------------------------------------------------------------
  sudokuPhotos: [
    "photos/her1.jpg",
    "photos/her2.jpg",
    "photos/her3.jpg",
    "photos/her4.jpg",
    "photos/her5.jpg",
    "photos/her6.jpg",
  ],

  // A fresh, genuinely valid random puzzle is generated every time the
  // page loads. This controls difficulty — how many of the 36 cells start
  // filled in. Lower = harder. ~14 is a solid medium difficulty.
  sudokuGivensCount: 14,

  // Want to use a SPECIFIC puzzle you already designed instead of a random
  // one? Fill in both of these (each a 6x6 array of rows, values 1-6) and
  // they'll be used exactly as given — sudokuPuzzle's 0s mark the blank
  // starting cells, sudokuSolution is the completed answer key. Leave both
  // as null to keep using the random generator above.
  sudokuPuzzle: null,
  // Example shape (uncomment and fill in to use your own):
  // sudokuPuzzle: [
  //   [1,0,0,4,0,6],
  //   [0,5,6,0,2,0],
  //   [2,0,1,5,0,4],
  //   [0,6,4,0,3,1],
  //   [3,1,0,6,0,5],
  //   [0,4,5,3,1,0],
  // ],
  sudokuSolution: null,
  // Example shape (must be the fully solved version of the puzzle above):
  // sudokuSolution: [
  //   [1,2,3,4,5,6],
  //   [4,5,6,1,2,3],
  //   [2,3,1,5,6,4],
  //   [5,6,4,2,3,1],
  //   [3,1,2,6,4,5],
  //   [6,4,5,3,1,2],
  // ],

  sudokuTeases: [
    { afterSeconds: 20, text: "too slow 🐢" },
    { afterSeconds: 45, text: "the numbers aren't going to place themselves..." },
    { afterSeconds: 70, text: "should I call a friend? 📞" },
    { afterSeconds: 100, text: "genuinely impressed at this point (not in a good way)" },
    { afterSeconds: 140, text: "ok I believe in you. mostly." },
  ],
  // Shown on the congrats screen after she solves the sudoku, before a
  // fireworks burst. The button floats in after congratsButtonDelayMs so
  // it's not competing with the fireworks for attention.
  congratsEyebrow: "Congratulations to my Smartie",
  sudokuWinMessage: "You've now unlocked your birthday message",
  congratsButtonLabel: "Reveal Card",
  congratsButtonDelayMs: 3000,

  // ---------------------------------------------------------------------
  // 4) THE REVEAL — your message + the photo collage
  // ---------------------------------------------------------------------
  recipientName: "Prinkles",
  revealHeadline: "Happy Birthday!",
  waxSealText: "❤", // shown inside the wax seal on the message card — try an emoji, "&", or initials like "A+J"
  // Your own message — supports multiple paragraphs, just add more strings.
  message: [
    "We may have first met when we were around 12 — surely shared the same space when you were born, lol, sounds like a prequel.",
    "Although I had never really spoken till I texted \"How are you always at wings\" — turns out you and I almost love & hate similar things.",
    "Immediately fell in love with those eyes, the way you view the world, the way you look at me, and not to forget the first time those eyes rolled. (so hot)",
    "Your bad jokes, your hysterical laugh, your cute smile — the way you somehow manage to make even the most ordinary days feel like a movie.",
    "Lucky to cross paths with you, know you, your pure compassionate heart.",
    "Thank you for being my absolute favorite person, my partner in bad jokes, and the best part of every single day.",
    "I pray this year brings you closer to every milestone you're chasing, and I'll be right here cheering you on. Let's celebrate this day as you turn 26 with more terrible jokes.",
    "— Happy Birthday Prinkles ❤",
  ],
  // Note: the reveal page reuses your single collage.jpg (teaserCollageImage
  // above) instead of needing a separate set of photos — same image shown
  // again here, plus it's also what forms the dimmed background behind the
  // quiz and sudoku screens. One collage file covers all three.

  // ---------------------------------------------------------------------
  // 5) OPTIONAL DATE LOCK
  // If you still want the WHOLE site to stay locked until a specific
  // moment (e.g. midnight on her birthday) regardless of the PIN,
  // set lockUntil to an ISO date string. Leave it as null to disable
  // and let the PIN be the only gate.
  // Format: "YYYY-MM-DDTHH:MM:SS"  (uses the visitor's local time)
  // ---------------------------------------------------------------------
  lockUntil: null, // e.g. "2026-09-01T00:00:00"
};
