// == Konteks ==
// - Menampilkan live chat YouTube secara otomatis saat channel sedang live
// - Menjaga konversi emoji teks (misalnya :_LIKE:) menjadi gambar
// - Menambahkan ikon moderator jika user adalah mod
// - Menampilkan badge membership jika user adalah sponsor

const API_KEY = "AIzaSyDwyVmxv3RKZETh-qgByWbQaVK7Naf4-L0"; // Ganti dengan API Key YouTube
const CHANNEL_ID = "UCibFcTqpMXuOKoJkX4UK0Dw"; // Ganti dengan Channel ID
let nextPageToken = "";
let pollingInterval = 5000; // default 5 detik

const emojiMap = {
  ":_LOVE:": "https://yt3.googleusercontent.com/GBA98bgNVXPmXWGcqUq-dkTxO8vVLbO5I9wc7_TVlQpJzXg5eiolw1Sfnv0sOrFNo3RUKeRJ_fQ",
  ":_LIKE:": "https://yt3.googleusercontent.com/4LBAvTkbhBn7EEaVAbVWzpsTiGKvdHgRcuwJKG6iWM467YufUd-uF229DKtQGq5LvtjiOWX4bmI",
  ":_takut:": "https://yt3.googleusercontent.com/hKcqUVRX93rdIRJmOFA69Gf3YX_ceMM7lTZf2OCWGNT7SnxkovTK62CoKifLUlMGSQ7EfCao3g",
  ":_Sus:": "https://yt3.googleusercontent.com/NHEw3e4tEIkeo5ErgqoWiXss1-CNJN-jhwpRYmJRMNOAV4Dp9lUN4y5uAOKLNFFRNjQclbHA_r8",
  ":_Nice:": "https://yt3.googleusercontent.com/G1KqpWi-oZ48YeRDiGZCfoJ9UWK_N46OnurGVu31vmLyyjzpZ7Ts2G8Ia31vrrhF_tKEZl8Q",
  ":_Wlee:": "https://yt3.googleusercontent.com/Jdym54Pn4MRbmKnp_bHUpCg7SoPQskfOBOU70qJw_JQ21PEj-PNFqRYJ6Jh20iO_Og0x3mPOeA",
  ":_Hmm:": "https://yt3.googleusercontent.com/MW47wFy372vLTz2lWhpZjiD6CR0SwbMpZ-BNccofhi53QumPg4vTUhofa2Mt4ro4CIVkVCa0Zw",
  ":_Yawn:": "https://yt3.googleusercontent.com/t1_0pWjgOwZAzAQXzBuEUY4afcPCyv2tsgp77VapGtyOBhukZyREUVXy5EmTOEWLJaKs1CwD",
  ":_Wkwk:": "https://yt3.googleusercontent.com/F1rSJ9p-vhFOUCEfEmtFXDw5gUqGNQiKuKo2TmupqkVIJvj4s3PRKIpumZQghREpxv4R2JqPubs",
  ":yt:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/yt.svg",
  ":buffering:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/buffering.svg",
  ":oops:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/oops.svg",
  ":awesome:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/awesome.svg",
  ":gar:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/gar.svg",
  ":jakepeter:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/jakepeter.svg",
  ":wormOrangeGreen:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/wormOrangeGreen.svg",
  ":wormRedBlue:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/wormRedBlue.svg",
  ":wormYellowRed:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/wormYellowRed.svg",
  ":ytg:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/ytg.svg",
  ":hand-pink-waving:": "https://yt3.ggpht.com/KOxdr_z3A5h1Gb7kqnxqOCnbZrBmxI2B_tRQ453BhTWUhYAlpg5ZP8IKEBkcvRoY8grY91Q=w24-h24-c-k-nd",
  ":face-blue-smiling:": "https://yt3.ggpht.com/cktIaPxFwnrPwn-alHvnvedHLUJwbHi8HCK3AgbHpphrMAW99qw0bDfxuZagSY5ieE9BBrA=w24-h24-c-k-nd",
  ":face-red-droopy-eyes:": "https://yt3.ggpht.com/oih9s26MOYPWC_uL6tgaeOlXSGBv8MMoDrWzBt-80nEiVSL9nClgnuzUAKqkU9_TWygF6CI=w24-h24-c-k-nd",
  ":face-purple-crying:": "https://yt3.ggpht.com/g6_km98AfdHbN43gvEuNdZ2I07MmzVpArLwEvNBwwPqpZYzszqhRzU_DXALl11TchX5_xFE=w24-h24-c-k-nd",
  ":text-green-game-over:": "https://yt3.ggpht.com/cr36FHhSiMAJUSpO9XzjbOgxhtrdJNTVJUlMJeOOfLOFzKleAKT2SEkZwbqihBqfTXYCIg=w24-h24-c-k-nd",
  ":person-turqouise-waving:": "https://yt3.ggpht.com/uNSzQ2M106OC1L3VGzrOsGNjopboOv-m1bnZKFGuh0DxcceSpYHhYbuyggcgnYyaF3o-AQ=w24-h24-c-k-nd",
  ":face-green-smiling:": "https://yt3.ggpht.com/G061SAfXg2bmG1ZXbJsJzQJpN8qEf_W3f5cb5nwzBYIV58IpPf6H90lElDl85iti3HgoL3o=w24-h24-c-k-nd",
  ":face-orange-frowning:": "https://yt3.ggpht.com/Ar8jaEIxzfiyYmB7ejDOHba2kUMdR37MHn_R39mtxqO5CD4aYGvjDFL22DW_Cka6LKzhGDk=w24-h24-c-k-nd",
  ":chillwcat:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/chillwcat.svg",
  ":chillwdog:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/chillwdog.svg",
  ":dothefive:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/dothefive.svg",
  ":elbowbump:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/elbowbump.svg",
  ":elbowcough:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/elbowcough.svg",
  ":goodvibes:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/goodvibes.svg",
  ":hydrate:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/hydrate.svg",
  ":learning:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/learning.svg",
  ":sanitizer:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/sanitizer.svg",
  ":shelterin:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/shelterin.svg",
  ":socialdist:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/socialdist.svg",
  ":stayhome:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/stayhome.svg",
  ":takeout:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/takeout.svg",
  ":thanksdoc:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/thanksdoc.svg",
  ":videocall:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/videocall.svg",
  ":virtualhug:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/virtualhug.svg",
  ":washhands:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/washhands.svg",
  ":yougotthis:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/yougotthis.svg"
};

function replaceTextEmojis(text) {
  let output = text;
  for (const key in emojiMap) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'g');
    output = output.replace(regex, `<img class=\"emoji\" src=\"${emojiMap[key]}\" alt=\"${key}\">`);
  }
  return output;
}

const chatBox = document.getElementById("chat");
chatBox.appendChild(container);
if (chatBox.childElementCount > 20) {
  chatBox.removeChild(chatBox.firstChild);
}

async function getLiveVideoId() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`);
  const data = await res.json();
  return data.items[0]?.id?.videoId || null;
}

async function getLiveChatId(videoId) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${API_KEY}`);
  const data = await res.json();
  return data.items[0]?.liveStreamingDetails?.activeLiveChatId || null;
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

      const modIcon = isModerator ? `<img class=\"mod-icon\" src=\"https://cdn-icons-png.freepik.com/256/9795/9795156.png\" alt=\"Mod\">` : "";
      const badge = isMember ? `<div class=\"badge\">MEMBER</div>` : "";

      container.innerHTML = `
        <img class=\"avatar\" src=\"${avatar}\" alt=\"Avatar\">
        <div class=\"content\">
          <div class=\"author\">
            ${modIcon}${author}${badge}
          </div>
          <div class=\"message\">${message}</div>
        </div>`;

      const chatBox = document.getElementById("chat");
      chatBox.appendChild(container);
      if (chatBox.childElementCount > 50) {
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
      setTimeout(startChatListener, 30000); // Cek lagi setiap 30 detik jika belum live
      return;
    }
    const chatId = await getLiveChatId(videoId);
    if (chatId) fetchChat(chatId);
    else throw new Error("Chat ID not found.");
  } catch (e) {
    console.error("Unable to start chat listener:", e);
    setTimeout(startChatListener, 30000); // Retry nanti
  }
}

startChatListener();
