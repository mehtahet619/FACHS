(() => {
  "use strict";

  const countNode = document.getElementById("hourly-active-count");
  const updatedNode = document.getElementById("hourly-active-updated");
  if (!countNode || !updatedNode) return;

  const STARTING_COUNT = 2059;
  const IST = "Asia/Kolkata";
  // Daily activity curve: [minute after midnight, expected activity].
  // The 12:00–14:30 interval is intentionally a zero-activity plateau.
  const curve = [
    [0, 13], [300, 12], [360, 17], [420, 164], [480, 247],
    [540, 226], [600, 181], [660, 143], [720, 0],
    [870, 0], [900, 103], [960, 1007], [1020, 2003],
    [1080, 2993], [1140, 2681], [1200, 2173], [1260, 1471],
    [1320, 817], [1380, 307], [1440, 13]
  ];

  let displayedCount = STARTING_COUNT;
  let timerId = null;

  function istParts(date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date);
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  }

  function dailyFactor(dateKey) {
    let hash = 216; 
    for (const char of dateKey) hash = (hash * 31 + char.charCodeAt(0)) % 1000003;
    return 0.94 + (hash % 121) / 1000;
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function expectedCount(minuteOfDay, factor) {
    if (minuteOfDay >= 720 && minuteOfDay < 870) return 0;
    let left = curve[0], right = curve[curve.length - 1];
    for (let i = 1; i < curve.length; i += 1) {
      if (minuteOfDay <= curve[i][0]) {
        left = curve[i - 1];
        right = curve[i];
        break;
      }
    }
    const span = right[0] - left[0] || 1;
    const progress = (minuteOfDay - left[0]) / span;
    return Math.max(0, Math.round((left[1] + (right[1] - left[1]) * progress) * factor));
  }

  function render(value, parts) {
    countNode.textContent = Math.max(0, value).toLocaleString("en-IN");
    updatedNode.textContent = "Updated " + parts.hour + ":" + parts.minute + " IST · refreshes every 60 seconds";
  }

  function update() {
    const now = new Date();
    const parts = istParts(now);
    const minuteOfDay = Number(parts.hour) * 60 + Number(parts.minute);
    const factor = dailyFactor(parts.year + parts.month + parts.day);
    const target = expectedCount(minuteOfDay, factor);

    if (target === 0) {
      displayedCount = 0;
    } else {
      const difference = target - displayedCount;
      const easingStep = Math.max(1, Math.round(difference * 0.18));
      const jitter = randomBetween(-Math.max(2, Math.round(target * 0.012)), Math.max(2, Math.round(target * 0.012)));
      displayedCount = Math.max(0, Math.round(displayedCount + easingStep + jitter));
    }

    // Avoid an artificial-looking rounded value while preserving the exact zero window.
    if (target > 0 && displayedCount > 0 && displayedCount % 10 === 0) displayedCount += randomBetween(-2, 3);
    displayedCount = Math.max(0, displayedCount);
    render(displayedCount, parts);
  }

  // Show the requested example value immediately; schedule-driven values begin on the first minute.
  countNode.textContent = STARTING_COUNT.toLocaleString("en-IN");
  update();
  timerId = window.setInterval(update, 60 * 1000);
  window.addEventListener("pagehide", () => {
    if (timerId !== null) window.clearInterval(timerId);
  }, { once: true });
})();
