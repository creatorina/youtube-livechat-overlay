const API_KEY = "YOUR_API_KEY"; // Ganti dengan API Key YouTube
const CHANNEL_ID = "YOUR_CHANNEL_ID"; // Ganti dengan Channel ID
let nextPageToken = "";

const emojiMap = {
  ":smile:": "https://twemoji.maxcdn.com/v/latest/72x72/1f604.png",
  ":heart:": "https://twemoji.maxcdn.com/v/latest/72x72/2764.png",
  ":thumbsup:": "https://twemoji.maxcdn.com/v/latest/72x72/1f44d.png",
  ":wink:": "https://twemoji.maxcdn.com/v/latest/72x72/1f609.png",
  ":laughing:": "https://twemoji.maxcdn.com/v/latest/72x72/1f606.png"
};

function replaceTextEmojis(text) {
  let output = text;
  for (const key in emojiMap) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'), 'g');
    output = output.replace(regex, `<img class="emoji" src="${emojiMap[key]}" alt="${key}">`);
  }
  return output;
}

async function getLiveChatId() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`);
  const data = await res.json();
  const videoId = data.items[0]?.id?.videoId;
  if (!videoId) throw new Error("No live video found");

  const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${API_KEY}`);
  const videoData = await videoRes.json();
  return videoData.items[0].liveStreamingDetails.activeLiveChatId;
}

async function fetchChat(liveChatId) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    nextPageToken = data.nextPageToken;

    data.items.forEach(item => {
      const author = item.authorDetails.displayName;
      const avatar = item.authorDetails.profileImageUrl;
      const message = replaceTextEmojis(item.snippet.displayMessage);
      const isMember = item.authorDetails.isChatSponsor;

      const container = document.createElement("div");
      container.className = "chat-message";
      container.innerHTML = `
        <img class="avatar" src="${avatar}" alt="Avatar">
        <div class="content">
          <div class="author">${author} ${isMember ? '<span style="color: gold;">★</span>' : ''}</div>
          <div class="message">${message}</div>
        </div>`;

      const chatBox = document.getElementById("chat");
      chatBox.appendChild(container);

      if (chatBox.childElementCount > 50) {
        chatBox.removeChild(chatBox.firstChild);
      }
    });

    setTimeout(() => fetchChat(liveChatId), data.pollingIntervalMillis || 3000);
  } catch (err) {
    console.error("Fetch chat error:", err);
    setTimeout(() => fetchChat(liveChatId), 5000);
  }
}

(async () => {
  try {
    const chatId = await getLiveChatId();
    fetchChat(chatId);
  } catch (e) {
    console.error("Unable to load chat:", e);
    document.getElementById("chat").innerHTML = "<p>🔴 Tidak ada siaran langsung saat ini.</p>";
  }
})();
