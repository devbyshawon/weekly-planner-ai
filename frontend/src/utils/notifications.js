let scheduledTimers = [];

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export function cancelAllNotifications() {
  scheduledTimers.forEach(clearTimeout);
  scheduledTimers = [];
}

export function scheduleNotifications(occurrences, minutesBefore = 0) {
  cancelAllNotifications();
  if (Notification.permission !== "granted") return;

  const now = Date.now();

  occurrences.forEach((occ) => {
    if (occ.completed) return;

    const [h, m] = occ.startTime.split(":").map(Number);
    const occDate = new Date(occ.date);
    occDate.setHours(h, m - minutesBefore, 0, 0);
    const fireAt = occDate.getTime();

    if (fireAt <= now) return; // already passed

    const delay = fireAt - now;
    if (delay > 2_147_483_647) return; // setTimeout max (~24.8 days)

    const timer = setTimeout(() => {
      new Notification(`⏰ ${occ.title}`, {
        body: minutesBefore > 0
          ? `Starting in ${minutesBefore} minute${minutesBefore > 1 ? "s" : ""}`
          : "It's time!",
        icon: "/favicon.svg",
        tag: `${occ.eventId}-${occ.date}`,
      });
    }, delay);

    scheduledTimers.push(timer);
  });
}
