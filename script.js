console.log("Lets write JavaScript");

// Function to fetch song URLs and extract song names
async function getsongs() {
  try {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        let songName = element.href.split("/").pop();
        songName = songName.replace(".mp3", "").replaceAll("%20", " ");
        songs.push(songName);
      }
    }
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

let currentAudio = null;
let currentIndex = 0;

// Main function to handle the song list and audio playback
async function main() {
  let songs = await getsongs();
  if (songs && songs.length > 0) {
    console.log(songs);
    let songul = document.querySelector(".songsList ul");
    for (const song of songs) {
      songul.innerHTML += `<li>
                <img src="music.svg" alt="" />
                <div class="info">
                  <div class="songname">${song}</div>
                </div>
                <div class="playNow">
                  Play Now<img src="playNow.svg" alt="" />
                </div>
              </li>`;
    }

    Array.from(songul.getElementsByTagName("li")).forEach((e, index) => {
      e.addEventListener("click", () => {
        currentIndex = index;
        playMusic(songs[index] + ".mp3");
      });
    });
  } else {
    console.log("No songs found.");
  }

  const playButton = document.querySelector(".playButton img");
  playButton.parentElement.addEventListener("click", togglePlayPause);

  const prevButton = document.querySelector(".prevbutton img");
  prevButton.parentElement.addEventListener("click", () => {
    if (songs && songs.length > 0) {
      currentIndex = (currentIndex - 1 + songs.length) % songs.length;
      playMusic(songs[currentIndex] + ".mp3");
    }
  });

  const nextButton = document.querySelector(".nextButton img");
  nextButton.parentElement.addEventListener("click", () => {
    if (songs && songs.length > 0) {
      currentIndex = (currentIndex + 1) % songs.length;
      playMusic(songs[currentIndex] + ".mp3");
    }
  });

  // Add spacebar event listener
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault(); // Prevent default spacebar action (scrolling)
      togglePlayPause();
    }
  });
}

// Function to play a selected song
const playMusic = (track) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeEventListener("timeupdate", updateTime);
    currentAudio.removeEventListener("ended", songEnded);
  }
  currentAudio = new Audio(`/songs/${track}`);

  currentAudio.addEventListener("timeupdate", updateTime);
  currentAudio.addEventListener("loadedmetadata", () => {
    updateSeekBar();
  });

  currentAudio.addEventListener("ended", songEnded);

  currentAudio.play();
  const playButton = document.querySelector(".playButton img");
  playButton.src = "pause.svg"; // Ensure the button changes to pause when a song starts
  document.querySelector(".songsinfo").textContent = track;
  document.querySelector(".songstime").textContent = "00:00 / 00:00";
};

// Function to toggle play/pause
const togglePlayPause = () => {
  const playButton = document.querySelector(".playButton img");
  if (currentAudio) {
    if (currentAudio.paused) {
      currentAudio.play();
      playButton.src = "pause.svg"; // Change to pause image
    } else {
      currentAudio.pause();
      playButton.src = "playButton.svg"; // Change to play image
    }
  }
};

// Function to update song time display
const updateTime = () => {
  if (currentAudio) {
    const currentTime = formatTime(currentAudio.currentTime);
    const duration = formatTime(currentAudio.duration);
    document.querySelector(
      ".songstime"
    ).textContent = `${currentTime} / ${duration}`;
    updateSeekBar();
  }
};

// Function to format time in MM:SS
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// Function to update the seek bar
const updateSeekBar = () => {
  if (currentAudio) {
    const seekBar = document.querySelector(".seekbar");
    const currentTimePercentage =
      (currentAudio.currentTime / currentAudio.duration) * 100;
    seekBar.querySelector(".circle").style.left = `${currentTimePercentage}%`;
  }
};

// Function to handle seek bar interaction
const handleSeekBar = (event) => {
  if (currentAudio) {
    const seekBar = document.querySelector(".seekbar");
    const seekBarRect = seekBar.getBoundingClientRect();
    const offsetX = event.clientX - seekBarRect.left;
    const seekBarWidth = seekBarRect.width;
    const seekPercentage = Math.max(0, Math.min(1, offsetX / seekBarWidth)); // Clamp between 0 and 1
    currentAudio.currentTime = seekPercentage * currentAudio.duration;
    updateSeekBar();
  }
};

// Function to handle when a song ends
const songEnded = () => {
  const playButton = document.querySelector(".playButton img");
  playButton.src = "playButton.svg"; // Change to play image when song ends
};

// Add event listeners to the seek bar
const seekBar = document.querySelector(".seekbar");
seekBar.addEventListener("click", handleSeekBar);
let isDragging = false;

seekBar.addEventListener("mousedown", () => {
  isDragging = true;
  document.addEventListener("mousemove", handleSeekBar);
});
document.addEventListener("mouseup", () => {
  isDragging = false;
  document.removeEventListener("mousemove", handleSeekBar);
});
document.addEventListener("keydown", (event) => {
  if (currentAudio) {
    if (event.code === "ArrowRight") {
      currentAudio.currentTime += 5; // Seek forward 5 seconds
    } else if (event.code === "ArrowLeft") {
      currentAudio.currentTime -= 5; // Seek backward 5 seconds
    }
  }
});
// Call the main function to execute the script
main();
