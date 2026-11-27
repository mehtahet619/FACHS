(() => {
  "use strict";

  const countNode = document.getElementById("hourly-active-count");
  const shareNode = document.getElementById("hourly-active-share");
  const updatedNode = document.getElementById("hourly-active-updated");
  if (!countNode || !shareNode || !updatedNode) return;

  const BASE_TOTAL_USERS = 2059;
  const BASE_DATE = "2026-11-26"; // Total users on this IST date: 2,059.
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

  function totalUsersFor(parts) {
    const todayKey = parts.year + "-" + parts.month + "-" + parts.day;
    const [baseYear, baseMonth, baseDay] = BASE_DATE.split("-").map(Number);
    const [year, month, day] = todayKey.split("-").map(Number);
    const baseUtc = Date.UTC(baseYear, baseMonth - 1, baseDay);
    const todayUtc = Date.UTC(year, month - 1, day);
    const daysElapsed = Math.max(0, Math.floor((todayUtc - baseUtc) / 86400000));

    let total = BASE_TOTAL_USERS;
    for (let dayOffset = 1; dayOffset <= daysElapsed; dayOffset += 1) {
      const date = new Date(baseUtc + dayOffset * 86400000);
      const dateKey = date.getUTCFullYear() + "-" +
        String(date.getUTCMonth() + 1).padStart(2, "0") + "-" +
        String(date.getUTCDate()).padStart(2, "0");
      total += (stableNoise("daily-growth:" + dateKey) % 10) + 1;
    }
    return total;
  }

  // Days when gyms are commonly closed across India: Sundays and the
  // three nationwide national holidays. Regional/state holidays are excluded.
  const GYM_CLOSED_NATIONAL_HOLIDAYS = new Set([
    "01-26", // Republic Day
    "08-15", // Independence Day
    "10-02"  // Gandhi Jayanti
  ]);

  function isGymClosedDay(parts) {
    const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
    const isSunday = date.getUTCDay() === 0;
    const isNationalHoliday = GYM_CLOSED_NATIONAL_HOLIDAYS.has(parts.month + "-" + parts.day);
    return isSunday || isNationalHoliday;
  }

  function expectedCount(minuteOfDay, dateKey, bucket) {
    // Show zero activity all day on Sundays and nationwide gym-closure holidays.
    // Regional/state holidays are intentionally not treated as nationwide closures.
    if (isGymClosedDay({ year: dateKey.slice(0, 4), month: dateKey.slice(4, 6), day: dateKey.slice(6, 8) })) return 0;

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

  function render(value, totalUsers, parts, slotMinute) {
    const percentage = (value / totalUsers * 100).toFixed(2);
    countNode.textContent = value.toLocaleString("en-IN");
    shareNode.textContent = value.toLocaleString("en-IN") + " of " +
      totalUsers.toLocaleString("en-IN") + " total users · " + percentage + "% active";
    const slotHour = String(Math.floor(slotMinute / 60)).padStart(2, "0");
    const slotMinuteText = String(slotMinute % 60).padStart(2, "0");
    updatedNode.textContent = "Updated " + slotHour + ":" + slotMinuteText +
      " IST · refreshes every 10 minutes";
  }

  function update() {
    const now = new Date();
    const parts = istParts(now);
    const minuteOfDay = Number(parts.hour) * 60 + Number(parts.minute);
    const slotMinute = Math.floor(minuteOfDay / 10) * 10;
    const dateKey = parts.year + parts.month + parts.day;
    const bucket = Math.floor(minuteOfDay / 10);
    const totalUsers = totalUsersFor(parts);

    // Derive the count only from the IST date and fixed 10-minute slot.
    // Refreshes and separate visitors therefore always get the same value.
    const value = expectedCount(minuteOfDay, dateKey, bucket);
    render(value, totalUsers, parts, slotMinute);
  }

  function scheduleNextUpdate() {
    // Align updates to wall-clock 10-minute boundaries, not page-load time.
    const delay = UPDATE_INTERVAL - (Date.now() % UPDATE_INTERVAL);
    timeoutId = window.setTimeout(() => {
      update();
      scheduleNextUpdate();
    }, delay);
  }

  update();
  scheduleNextUpdate();

  window.addEventListener("pagehide", () => {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  }, { once: true });
})();
