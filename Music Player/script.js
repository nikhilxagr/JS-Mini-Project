const song = document.getElementById("song");
const progress = document.getElementById("progress");
const ctrlIcon = document.getElementById("ctrlIcon");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const playBtn = document.getElementById("play-btn");
const forwardBtn = document.getElementById("forward");
const backwardBtn = document.getElementById("backward");


function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

song.onloadedmetadata = function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
  durationEl.textContent = formatTime(song.duration);
  currentTimeEl.textContent = formatTime(song.currentTime);
};


playBtn.addEventListener("click", () => {
  if (song.paused) {
    song.play();
    ctrlIcon.classList.remove("fa-play");
    ctrlIcon.classList.add("fa-pause");
  } else {
    song.pause();
    ctrlIcon.classList.remove("fa-pause");
    ctrlIcon.classList.add("fa-play");
  }
});


song.addEventListener("timeupdate", () => {
  progress.value = song.currentTime;
  currentTimeEl.textContent = formatTime(song.currentTime);
});


progress.addEventListener("input", () => {
  song.currentTime = progress.value;
  currentTimeEl.textContent = formatTime(song.currentTime);
});


forwardBtn.addEventListener("click", () => {
  song.currentTime = Math.min(
    song.currentTime + 5,
    song.duration || song.currentTime
  );
});


backwardBtn.addEventListener("click", () => {
  song.currentTime = Math.max(song.currentTime - 5, 0);
});


song.addEventListener("ended", () => {
  ctrlIcon.classList.remove("fa-pause");
  ctrlIcon.classList.add("fa-play");
  progress.value = 0;
  currentTimeEl.textContent = "0:00";
});
