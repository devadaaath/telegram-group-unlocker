const UNLOCK_TEXT = `🔐 GROUP ACCESS

Want to unlock the group? 👀

📢 Share this link with 3 Telegram groups!

👇 Share below and try again.`;

const ANNOUNCEMENTS = [
  "🔓 Someone unlocked group access",
  "🔓 A user unlocked group access",
  "🔓 Someone unlocked the VIP group",
  "🔓 Group access unlocked!"
];

async function telegram(env, method, data) {
  const response = await fetch(
    `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  );

  return response.json();
}

function buttons(env) {
  return {
    inline_keyboard: [
      [{
        text: "📤 Share on Telegram",
        url:
          "https://t.me/share/url?url=" +
          encodeURIComponent(env.GROUP_LINK) +
          "&text=" +
          encodeURIComponent("Join our Telegram group!")
      }],
      [{
        text: "🔓 Unlock",
        callback_data: "unlock"
      }]
    ]
  };
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Group Unlocker is running!");
    }

    let update;

    try {
      update = await request.json();
    } catch {
      return new Response("Invalid request", { status: 400 });
    }

    if (update.callback_query) {
      const q = update.callback_query;
      const msg = q.message;

      await telegram(env, "answerCallbackQuery", {
        callback_query_id: q.id
      });

      if (
        !msg ||
        !["group", "supergroup"].includes(msg.chat.type) ||
        q.data !== "unlock"
      ) {
        return new Response("OK");
      }

      await telegram(env, "editMessageText", {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        text: UNLOCK_TEXT,
        reply_markup: buttons(env)
      });

      return new Response("OK");
    }

    return new Response("OK");
  },

  async scheduled(event, env, ctx) {
    const text =
      ANNOUNCEMENTS[Math.floor(Math.random() * ANNOUNCEMENTS.length)];

    ctx.waitUntil(
      telegram(env, "sendMessage", {
        chat_id: env.GROUP_CHAT_ID,
        text
      })
    );
  }
};
