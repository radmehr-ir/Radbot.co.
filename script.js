
const API_URL = "https://api.gapgpt.app/v1/chat/completions";
const API_KEY = "sk-jnygCUUW5oSpMUsHkEKx7zz8ph7GfOEVpqqmLUAg0obad9U6";

function appendMessage(role, text) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = "msg " + (role === "user" ? "user" : "bot");
  msg.textContent = (role === "user" ? "🧑 شما:\n" : "🤖 RadBot:\n") + text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function detectLanguage(text) {
  const persian = /[آ-ی]/, arabic = /[ء-ي]/, french = /[éèêàçû]/, english = /[a-zA-Z]/;
  if (persian.test(text)) return 'fa-IR';
  if (arabic.test(text)) return 'ar-SA';
  if (french.test(text)) return 'fr-FR';
  if (english.test(text)) return 'en-US';
  return 'en-US';
}

function speak(text) {
  const lang = detectLanguage(text);
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  const voices = synth.getVoices();
  let voice = voices.find(v => v.lang === lang);
  if (!voice && lang === "fa-IR") {
    voice = voices.find(v => v.lang.startsWith("fa") || v.lang.startsWith("ar"));
  }
  if (voice) utter.voice = voice;
  synth.cancel();
  synth.speak(utter);
}

async function sendToGPT(message) {
  document.getElementById("loading").style.display = "block";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;
    appendMessage("bot", reply);
    speak(reply);
  } catch (err) {
    appendMessage("bot", "❌ خطا در اتصال با RadBot.");
    console.error(err);
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function sendMessage() {
  const input = document.getElementById("input");
  const message = input.value.trim();
  if (!message) return;
  appendMessage("user", message);
  input.value = '';
  sendToGPT(message);
}

function startListening() {
  const input = document.getElementById("input");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "fa-IR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    sendMessage();
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    alert("خطا در دریافت صدا: " + event.error);
  };
}

document.getElementById("input").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

window.speechSynthesis.onvoiceschanged = () => {};

window.onload = () => {
  const welcome = "سلام! من chatbot رادمهر محمدی هستم. چه کمکی از دستم برمیاد؟";
  appendMessage("bot", welcome);
  speak(welcome);
};
