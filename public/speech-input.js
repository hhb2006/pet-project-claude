// Browser speech-to-text adapter for the chat composer. The browser owns the
// recognition service; this app never records or uploads audio itself.
(function exposeVoiceInput(root) {
  function create({ input, button, status, translate, getLang, onTranscript }) {
    const Recognition = root.SpeechRecognition || root.webkitSpeechRecognition;
    if (!Recognition) {
      button.hidden = true;
      return Object.freeze({ supported: false, stop() {}, abort() {}, isListening: () => false });
    }

    let recognition = null;
    let listening = false;
    let baseText = "";
    let finalTranscript = "";
    let renderedText = "";

    button.hidden = false;
    button.addEventListener("click", () => listening ? stop() : start());
    input.addEventListener("input", () => {
      if (listening && input.value !== renderedText) abort({ showStopped: true });
    });

    function language() {
      return getLang() === "zh" ? "zh-CN" : "en-US";
    }

    function setStatus(key, error = false) {
      status.textContent = key ? translate(key) : "";
      status.hidden = !key;
      status.classList.toggle("error", error);
      status.setAttribute("role", error ? "alert" : "status");
      status.setAttribute("aria-live", error ? "assertive" : "polite");
    }

    function setListening(next) {
      listening = next;
      button.classList.toggle("listening", next);
      button.setAttribute("aria-pressed", String(next));
      const label = translate(next ? "voice_stop" : "voice_start");
      button.setAttribute("aria-label", label);
      button.title = label;
    }

    function render(interimTranscript = "") {
      const spoken = joinSpeech(finalTranscript, interimTranscript, getLang());
      renderedText = joinSpeech(baseText, spoken, getLang());
      input.value = renderedText;
      onTranscript();
    }

    function start() {
      recognition = new Recognition();
      recognition.lang = language();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      baseText = input.value;
      finalTranscript = "";
      renderedText = input.value;

      recognition.onresult = event => {
        if (!listening) return;
        let interimTranscript = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const transcript = event.results[index][0] && event.results[index][0].transcript || "";
          if (event.results[index].isFinal) {
            finalTranscript = joinSpeech(finalTranscript, transcript, getLang());
          } else {
            interimTranscript = joinSpeech(interimTranscript, transcript, getLang());
          }
        }
        render(interimTranscript);
      };

      recognition.onerror = event => {
        if (event.error === "aborted") return;
        setListening(false);
        const key = event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "voice_denied"
          : event.error === "no-speech" ? "voice_no_speech" : "voice_unavailable";
        setStatus(key, true);
      };

      recognition.onend = () => {
        if (!listening) return;
        setListening(false);
        setStatus("voice_stopped");
      };

      try {
        recognition.start();
        setListening(true);
        setStatus("voice_listening");
      } catch (error) {
        console.error("Could not start voice input", error);
        setListening(false);
        setStatus("voice_unavailable", true);
      }
    }

    function stop() {
      if (!listening) return;
      setListening(false);
      setStatus("voice_stopped");
      try { recognition.stop(); } catch {}
    }

    function abort({ showStopped = false } = {}) {
      if (!recognition) return;
      const wasListening = listening;
      setListening(false);
      try { recognition.abort(); } catch {}
      recognition = null;
      if (showStopped && wasListening) setStatus("voice_stopped");
      else setStatus("");
    }

    setListening(false);
    return Object.freeze({
      supported: true,
      stop,
      abort,
      isListening: () => listening,
    });
  }

  function joinSpeech(base, addition, lang) {
    const left = String(base || "").trimEnd();
    const right = String(addition || "").trim();
    if (!left) return right;
    if (!right) return left;
    const separator = lang === "zh" ? "" : " ";
    return left + separator + right;
  }

  root.VoiceInput = Object.freeze({ create, joinSpeech });
})(globalThis);
