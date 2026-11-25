(() => {
  "use strict";

  const countNode = document.getElementById("hourly-active-count");
  const shareNode = document.getElementById("hourly-active-share");
  const updatedNode = document.getElementById("hourly-active-updated");
  if (!countNode || !shareNode || !updatedNode) return;

  const TOTAL_USERS = 2059;
  const IST = "Asia/Kolkata";
  const UPDATE_INTERVAL = 10 * 60 * 1000;

  // Expected activity by time of day (IST). The evening peak is capped at 500.
  // Values are interpolated so the count rises and falls gradually.
  const curve = [
    [0, 8], [300, 3], [360, 18], [420, 155], [480, 245],
    [540, 220], [600, 170], [660, 110], [720, 75],
    [840, 45], [900, 60], [960, 120], [1020, 210],
    [1080, 300], [1100, 370], [1120, 430], [1140, 480],
    [1150, 500], [1160, 470], [1170, 430], [1180, 340],
    [1190, 80], [1199, 12], [1200, 12], [1440, 5]
  ];

  let displayedCount = null;
  let intervalId = null;
  let timeoutId = null;

  function istParts(date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: IST,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  }

  function stableNoise(seed) {
    let hash = 216;
    for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 1000003;
    return hash;
  }

  function expectedCount(minuteOfDay, dateKey, bucket) {
    // No simulated activity between midnight and 6:00 AM IST.
    if (minuteOfDay < 360) return 0;

    let left = curve[0];
    let right = curve[curve.length - 1];
    for (let i = 1; i < curve.length; i += 1) {
      if (minuteOfDay <= curve[i][0]) {
        left = curve[i - 1];
        right = curve[i];
        break;
      }
    }

    const span = right[0] - left[0] || 1;
    const progress = (minuteOfDay - left[0]) / span;
    const baseline = left[1] + (right[1] - left[1]) * progress;
    const seed = stableNoise(dateKey + ":" + bucket);
    const dailyFactor = 0.94 + (stableNoise(dateKey) % 121) / 1000;
    const noiseRange = Math.max(1, Math.round(baseline * 0.045));
    const noise = (seed % (noiseRange * 2 + 1)) - noiseRange;
    let target = Math.round(baseline * dailyFactor + noise);

    // At and after 8:00 PM, always show fewer than 20 active users.
    if (minuteOfDay >= 1200) target = Math.min(target, 19);
    return Math.min(500, Math.max(1, target));
  }

  function render(value, parts) {
    const percentage = (value / TOTAL_USERS * 100).toFixed(2);
    countNode.textContent = value.toLocaleString("en-IN");
    shareNode.textContent = value.toLocaleString("en-IN") + " of " +
      TOTAL_USERS.toLocaleString("en-IN") + " total users · " + percentage + "% active";
    updatedNode.textContent = "Updated " + parts.hour + ":" + parts.minute +
      " IST · refreshes every 10 minutes";
  }

  function update() {
    const now = new Date();
    const parts = istParts(now);
    const minuteOfDay = Number(parts.hour) * 60 + Number(parts.minute);
    const dateKey = parts.year + parts.month + parts.day;
    const bucket = Math.floor(minuteOfDay / 10);
    const target = expectedCount(minuteOfDay, dateKey, bucket);

    if (minuteOfDay < 360) {
      displayedCount = 0;
    } else if (displayedCount === null || displayedCount === 0) {
      displayedCount = target;
    } else if (minuteOfDay >= 1200) {
      displayedCount = Math.min(target, 19);
    } else {
      const difference = target - displayedCount;
      const step = Math.max(-30, Math.min(30, difference));
      displayedCount = Math.max(1, Math.min(500, displayedCount + step));
    }

    render(Math.round(displayedCount), parts);
  }

  function scheduleUpdates() {
    const now = new Date();
    const delay = UPDATE_INTERVAL - (now.getTime() % UPDATE_INTERVAL);
    timeoutId = window.setTimeout(() => {
      update();
      intervalId = window.setInterval(update, UPDATE_INTERVAL);
    }, delay);
  }

  update();
  scheduleUpdates();

  window.addEventListener("pagehide", () => {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    if (intervalId !== null) window.clearInterval(intervalId);
  }, { once: true });
})();
