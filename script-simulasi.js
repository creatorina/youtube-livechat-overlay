const emojiMap = {
  ":_LIKE:": "https://yt3.googleusercontent.com/4LBAvTkbhBn7EEaVAbVWzpsTiGKvdHgRcuwJKG6iWM467YufUd-uF229DKtQGq5LvtjiOWX4bmI",
  ":_Nice:": "https://yt3.googleusercontent.com/G1KqpWi-oZ48YeRDiGZCfoJ9UWK_N46OnurGVu31vmLyyjzpZ7Ts2G8Ia31vrrhF_tKEZl8Q",
  ":dothefive:": "https://www.gstatic.com/youtube/img/emojis/emojis-svg/dothefive.svg"
};

function replaceTextEmojis(text) {
  let output = text;
  for (const key in emojiMap) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'), 'g');
    output = output.replace(regex, `<img class="emoji" src="${emojiMap[key]}" alt="${key}">`);
  }
  return output;
}

const dummyChats = [
  {
    author: "MODERATOR123",
    avatar: "https://yt3.ggpht.com/ytc/AAUvwngsQs-avatar.png",
    isMod: true,
    isMember: true,
    message: "Halo semua! :_LIKE:"
  },
  {
    author: "MemberLoyal",
    avatar: "https://yt3.ggpht.com/ytc/AAUvwngBbbbb-avatar.png",
    isMod: false,
    isMember: true,
    message: "Selamat datang! :_Nice:"
  },
  {
    author: "Pengunjung",
    avatar: "https://yt3.ggpht.com/ytc/AAUvwngRandom-avatar.png",
    isMod: false,
    isMember: false,
    message: "Mantap stream-nya! :dothefive:"
  }
];

function injectDummyChat() {
  const chatBox = document.getElementById("chat");
  dummyChats.forEach((user, i) => {
    setTimeout(() => {
      const modIcon = user.isMod ? `<img class="mod-icon" src="https://cdn-icons-png.freepik.com/256/9795/9795156.png" alt="Mod">` : "";
      const badge = user.isMember ? `<div class="badge">MEMBER</div>` : "";
      const msg = replaceTextEmojis(user.message);
      const container = document.createElement("div");
      container.className = "chat-message";
      container.innerHTML = `
        <img class="avatar" src="${user.avatar}" alt="Avatar">
        <div class="content">
          <div class="author">${modIcon}${user.author}${badge}</div>
          <div class="message">${msg}</div>
        </div>`;
      chatBox.appendChild(container);
    }, 1000 * (i + 1));
  });
}

injectDummyChat();
