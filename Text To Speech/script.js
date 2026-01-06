const textInput = document.getElementById("text");
const voiceSelect = document.getElementById("voiceSelect");
const rateInput = document.getElementById("rate");
const pitchInput = document.getElementById("pitch");
const volumeInput = document.getElementById("volume");

let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";

  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = voice.name + " (" + voice.lang + ")";
    voiceSelect.appendChild(option);
  });
}

speechSynthesis.onvoiceschanged = loadVoices;

function speakText() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(textInput.value);
  utterance.voice = voices[voiceSelect.value];
  utterance.rate = rateInput.value;
  utterance.pitch = pitchInput.value;
  utterance.volume = volumeInput.value;

  speechSynthesis.speak(utterance);
}

function stopSpeech() {
  speechSynthesis.cancel();
}
