// -----------------------------
// Global Variables
// -----------------------------

let songs = [];

let currentIndex = 0;

let player;

let playerReady = false;

const songList = document.getElementById("songList");

const playPauseBtn = document.getElementById("playPause");

const cover = document.getElementById("cover");

const title = document.getElementById("title");

const artist = document.getElementById("artist");

const playlist = document.getElementById("playlist");

const menuBtn = document.getElementById("menuBtn");

const closePlaylist = document.getElementById("closePlaylist");


// -----------------------------
// Playlist Drawer
// -----------------------------

menuBtn.onclick = () => {

    playlist.classList.add("show");

};

closePlaylist.onclick = () => {

    playlist.classList.remove("show");

};


// -----------------------------
// Load Songs
// -----------------------------

fetch("songs.json")
    .then(res => res.json())
    .then(data => {

        songs = data;

        renderPlaylist();

    });


// -----------------------------
// Render Playlist
// -----------------------------

function renderPlaylist() {

    songList.innerHTML = "";

    songs.forEach((song, index) => {

        const div = document.createElement("div");

        div.className = "song";

        div.innerHTML = `

            <img src="${song.cover}">

            <div class="song-info">

                <div class="song-title">${song.title}</div>

                <div class="song-artist">${song.artist}</div>

            </div>

        `;

        div.onclick = () => {

            currentIndex = index;

            loadSong();

            playlist.classList.remove("show");

        };

        songList.appendChild(div);

    });

}


// -----------------------------
// Highlight Current Song
// -----------------------------

function updatePlaylistHighlight() {

    document.querySelectorAll(".song").forEach((song, index) => {

        song.classList.toggle("active", index === currentIndex);

    });

}


// -----------------------------
// YouTube API
// -----------------------------

function onYouTubeIframeAPIReady() {

    player = new YT.Player("player", {

        height: "1",

        width: "1",

        videoId: "",

        playerVars: {

            autoplay: 0,

            controls: 0,

            modestbranding: 1,

            rel: 0

        },

        events: {

            onReady: onPlayerReady,

            onStateChange: onPlayerStateChange

        }

    });

}


// -----------------------------
// Player Ready
// -----------------------------

function onPlayerReady() {

    console.log("YouTube Player Ready");

    playerReady = true;

    if (songs.length > 0) {

        loadSong();

    }

}

// -----------------------------
// Load Song
// -----------------------------

function loadSong() {

    if (!playerReady || songs.length === 0) return;

    const song = songs[currentIndex];

    title.textContent = song.title;

    artist.textContent = song.artist;

    cover.src = song.cover;

    player.cueVideoById({
        videoId: song.youtubeId
});

    playPauseBtn.innerHTML = "▶";

    cover.classList.remove("playing");

    updatePlaylistHighlight();

}


// -----------------------------
// Play / Pause
// -----------------------------

playPauseBtn.onclick = () => {

    if (!playerReady) return;

    const state = player.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {

        player.pauseVideo();

    } else {

        player.playVideo();

    }

};


// -----------------------------
// Previous Song
// -----------------------------

document.getElementById("prev").onclick = () => {

    if (songs.length === 0) return;

    currentIndex--;

    if (currentIndex < 0) {

        currentIndex = songs.length - 1;

    }

    loadSong();

    player.playVideo();

};


// -----------------------------
// Next Song
// -----------------------------

document.getElementById("next").onclick = () => {

    nextSong();

};


function nextSong() {

    if (songs.length === 0) return;

    currentIndex++;

    if (currentIndex >= songs.length) {

        currentIndex = 0;

    }

    loadSong();

    player.playVideo();

}


// -----------------------------
// Player State
// -----------------------------

function onPlayerStateChange(event) {

    switch (event.data) {

        case YT.PlayerState.PLAYING:

            playPauseBtn.innerHTML = "⏸";

            cover.classList.add("playing");

            break;

        case YT.PlayerState.PAUSED:

            playPauseBtn.innerHTML = "▶";

            cover.classList.remove("playing");

            break;

        case YT.PlayerState.CUED:

            playPauseBtn.innerHTML = "▶";

            cover.classList.remove("playing");

            break;

        case YT.PlayerState.ENDED:

            cover.classList.remove("playing");

            nextSong();

            break;

    }

}

// -----------------------------
// Progress Bar
// -----------------------------

const progress = document.getElementById("progress");

const currentTimeEl = document.getElementById("currentTime");

const durationEl = document.getElementById("duration");


// -----------------------------
// Format Time
// -----------------------------

function formatTime(seconds) {

    seconds = Math.floor(seconds);

    const minutes = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${minutes}:${String(secs).padStart(2, "0")}`;

}


// -----------------------------
// Update Progress Every Second
// -----------------------------

setInterval(() => {

    if (!playerReady) return;

    if (!player.getCurrentTime) return;

    const duration = player.getDuration();

    const current = player.getCurrentTime();

    // Duration becomes available after the video is loaded
    if (duration > 0) {

        durationEl.textContent = formatTime(duration);

        currentTimeEl.textContent = formatTime(current);

        progress.value = (current / duration) * 100;

    }

}, 500);


// -----------------------------
// Seek
// -----------------------------

progress.addEventListener("input", () => {

    if (!playerReady) return;

    const duration = player.getDuration();

    if (duration <= 0) return;

    const seekTo = duration * progress.value / 100;

    player.seekTo(seekTo, true);

});