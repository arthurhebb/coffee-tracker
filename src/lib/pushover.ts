export async function sendPushNotification(title: string, message: string, priority: number = 0) {
  const res = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: process.env.PUSHOVER_API_TOKEN,
      user: process.env.PUSHOVER_USER_KEY,
      title,
      message,
      priority,
    }),
  });

  return res.json();
}
