import assert from "node:assert/strict";
import test from "node:test";

await import("../public/speech-input.js");
const { joinSpeech } = globalThis.VoiceInput;

test("joins English speech with readable spacing", () => {
  assert.equal(joinSpeech("Ame looks", "tired", "en"), "Ame looks tired");
  assert.equal(joinSpeech("Ame looks ", "tired", "en"), "Ame looks tired");
});

test("joins Chinese speech without inserting artificial spaces", () => {
  assert.equal(joinSpeech("A今天", "看起来不高兴", "zh"), "A今天看起来不高兴");
  assert.equal(joinSpeech("", "  它没有吃饭  ", "zh"), "它没有吃饭");
});

test("starts, transcribes, and stops through the browser recognition adapter", () => {
  class FakeElement {
    constructor(value = "") {
      this.value = value;
      this.hidden = true;
      this.textContent = "";
      this.title = "";
      this.listeners = {};
      this.attributes = {};
      this.classes = new Set();
      this.classList = { toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name) };
    }
    addEventListener(type, listener) { this.listeners[type] = listener; }
    setAttribute(name, value) { this.attributes[name] = value; }
    emit(type) { this.listeners[type](); }
  }

  class FakeRecognition {
    constructor() { FakeRecognition.current = this; }
    start() { this.started = true; }
    stop() { this.stopped = true; }
    abort() { this.aborted = true; }
  }

  globalThis.SpeechRecognition = FakeRecognition;
  const input = new FakeElement("Ame looks");
  const button = new FakeElement();
  const status = new FakeElement();
  let transcriptUpdates = 0;
  const voice = globalThis.VoiceInput.create({
    input,
    button,
    status,
    translate: key => key,
    getLang: () => "en",
    onTranscript: () => { transcriptUpdates += 1; },
  });

  assert.equal(voice.supported, true);
  assert.equal(button.hidden, false);
  button.emit("click");
  assert.equal(FakeRecognition.current.started, true);
  assert.equal(FakeRecognition.current.lang, "en-US");
  assert.equal(button.attributes["aria-pressed"], "true");
  assert.equal(status.textContent, "voice_listening");

  const result = [{ transcript: "happy today" }];
  result.isFinal = false;
  FakeRecognition.current.onresult({ resultIndex: 0, results: [result] });
  assert.equal(input.value, "Ame looks happy today");
  assert.equal(transcriptUpdates, 1);

  button.emit("click");
  assert.equal(FakeRecognition.current.stopped, true);
  assert.equal(button.attributes["aria-pressed"], "false");
  assert.equal(status.textContent, "voice_stopped");
  delete globalThis.SpeechRecognition;
});
