const API_KEY = "API KEY KAMU";
const CHANNEL_ID = "ID CHANEL KM";
let nextPageToken = "";
let pollingInterval = 5000;

function replaceTextEmojis(text) {
  let output = text;
  for (const key in emojiMap) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    output = output.replace(regex, `<img class="emoji" src="${emojiMap[key]}" alt="${key}">`);
  }
  return output;
}

async function getLiveVideoId() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`);
  const data = await res.json();
  return data.items?.[0]?.id?.videoId || null;
}

async function getLiveChatId(videoId) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${API_KEY}`);
  const data = await res.json();
  return data.items?.[0]?.liveStreamingDetails?.activeLiveChatId || null;
}

async function fetchChat(liveChatId) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    nextPageToken = data.nextPageToken;
    pollingInterval = data.pollingIntervalMillis || 3000;

    data.items.forEach(item => {
      const author = item.authorDetails.displayName;
      const avatar = item.authorDetails.profileImageUrl;
      const message = replaceTextEmojis(item.snippet.displayMessage);
      const isMember = item.authorDetails.isChatSponsor;
      const isModerator = item.authorDetails.isChatModerator;

      const container = document.createElement("div");
      container.className = "chat-message";

      const modIcon = isModerator ? `<img class="mod-icon" src="https://cdn-icons-png.freepik.com/256/9795/9795156.png" alt="Mod">` : "";
      const badge = isMember ? `<div class="badge">MEMBER</div>` : "";

      container.innerHTML = `
        <div class="avatar-wrapper">
          <img class="avatar" src="${avatar}" alt="Avatar">
          <img class="avatar-frame" src="frame.png" alt="Frame">
        </div>
        <div class="content">
          <div class="author">${modIcon}${author}${badge}</div>
          <div class="message">${message}</div>
        </div>
      `;

      const chatBox = document.getElementById("chat");
      chatBox.appendChild(container);
      if (chatBox.childElementCount > 30) {
        chatBox.removeChild(chatBox.firstChild);
      }
    });
  } catch (err) {
    console.error("Fetch chat error:", err);
  } finally {
    setTimeout(() => fetchChat(liveChatId), pollingInterval);
  }
}

async function startChatListener() {
  try {
    const videoId = await getLiveVideoId();
    if (!videoId) {
      document.getElementById("chat").innerHTML = "<p>🔴 Tidak ada siaran langsung saat ini.</p>";
      setTimeout(startChatListener, 30000);
      return;
    }
    const chatId = await getLiveChatId(videoId);
    if (chatId) fetchChat(chatId);
    else throw new Error("Chat ID not found.");
  } catch (e) {
    console.error("Unable to start chat listener:", e);
    setTimeout(startChatListener, 30000);
  }
}

startChatListener();
