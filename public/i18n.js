// Language support: English and Simplified Chinese.
//
// The choice is remembered in this browser and also sent to the serverless
// functions, so the assistant answers in the same language as the interface.

const I18N = {
  en: {
    app_title: "Pet Behavior Journal",
    app_tagline: "A gentle place to notice, record, and understand what your pets do.",
    add_pet: "Add a pet",
    name_ph: "Name (e.g. Ame)",
    name_label_ph: "Name",
    species_ph: "Species…",
    species_other_ph: "What kind of pet?",
    breed_ph: "Breed…",
    breed_free_ph: "Breed",
    breed_optional_ph: "Breed (optional)",
    pet_hint: "Each pet gets their own log, documents, and reports.",
    create: "Create",
    no_pets: "No pets yet.",
    no_pets_sub: "Add one above to start their journal.",
    privacy_note: "Everything is saved privately in this browser. A record of what you observed — never a diagnosis.",
    last_logged: "last logged {d}",
    delete: "Delete",
    confirm_delete_pet: "Delete {name} and everything logged for them? This can't be undone.",
    ask_name: "What's your pet called?",
    ask_species: "What kind of pet are they?",
    migrated: 'Welcome back! Your existing {n} moved into a pet called "{name}". You can rename or delete them any time.',

    back_all_pets: "← All pets",
    edit_details: "Edit details",
    save: "Save",
    cancel: "Cancel",
    tab_chat: "Chat",
    tab_log: "Log",
    tab_docs: "Documents",

    new_chat: "＋ New chat",
    del_chat_title: "Delete this chat",
    your_chats: "Your chats",
    chat_ph: "Ask about {name}, or describe what they did…",
    send: "Send",
    greet: "Tell me about {name} — ask me anything, or describe something they did. You can add any message to the log afterwards.",
    hint_free: "Chat freely — nothing is saved to the log unless you add it.",
    hint_logging: "Added to {name}'s log — answer to fill in the details, or ",
    skip_rest: "skip the rest",
    skipped: "No problem — I've left it as it is.",
    advice_pill: "Advice · not logged",
    add_to_log: "＋ Add to log",
    added_to_log: "✓ Added to log",
    lets_write: "Let's write that down for {name}.",
    written_down: "Written down for {name} 🐾",
    confirm_del_chat: "Delete this chat? Anything already added to {name}'s log stays.",
    new_chat_title: "New chat",

    f_behavior: "Behavior",
    f_trigger: "Possible trigger",
    f_when: "When",
    f_duration: "Duration",
    f_intensity: "Intensity (1–10)",
    f_recovery: "Recovery period",
    not_recorded: "not recorded",
    thinking: "thinking…",
    thinking_btn: "Thinking…",
    err_generic: "Something went wrong.",
    err_unreachable: "I couldn't reach the assistant just now. Please try again.",

    logged_events: "Logged events",
    nothing_logged: "Nothing logged for {name} yet.",
    create_report: "Create report",
    dl_log: "Download log (JSON)",
    no_entries: "No entries yet.",
    no_entries_sub: 'Chat about {name}, then choose "＋ Add to log" under any message you send.',
    confirm_del_entry: "Delete this entry? The chat it came from stays.",
    trigger_label: "trigger",
    save_to_docs: "Save to documents",
    saved_check: "Saved ✓",
    dl_txt: "Download .txt",
    close_report: "Close report",
    patterns_noticed: "Patterns noticed",

    add_note: "Add a note",
    note_title_ph: "Title (e.g. Vet visit, 12 July)",
    note_body_ph: "Anything you want to remember — vet visits, medication, diet changes…",
    save_note: "Save note",
    attach: "Attach a file",
    attach_hint: "Files (photos, vet paperwork) are stored in this browser only.",
    no_docs: "No documents yet.",
    no_docs_sub: "Save a report or write a note above.",
    doc_report: "Report",
    doc_note: "Note",
    note_fallback: "Note",
    read: "Read",
    download: "Download",
    confirm_del_doc: 'Delete "{title}"?',
    pet_note: "Saved privately in this browser. A record of what you observed — never a diagnosis. For anything worrying, please talk to a vet.",

    report_title: "BEHAVIOR OBSERVER'S REPORT — {name}",
    report_generated: "Generated {d}",
    report_based: "Based on {n}.",
    report_span: "Entries span {a} to {b}.",
    report_disclaimer: "An observational summary of what was recorded — not a medical document.",
  },

  zh: {
    app_title: "宠物行为日志",
    app_tagline: "一个温柔的地方，记录、观察并理解你的宠物。",
    add_pet: "添加宠物",
    name_ph: "名字（例如：Ame）",
    name_label_ph: "名字",
    species_ph: "物种…",
    species_other_ph: "是什么宠物？",
    breed_ph: "品种…",
    breed_free_ph: "品种",
    breed_optional_ph: "品种（可选）",
    pet_hint: "每只宠物都有自己的日志、文档和报告。",
    create: "创建",
    no_pets: "还没有宠物。",
    no_pets_sub: "在上面添加一只，开始它的日志吧。",
    privacy_note: "所有内容都只保存在此浏览器中。这是你观察到的记录——绝不是诊断。",
    last_logged: "最近记录于 {d}",
    delete: "删除",
    confirm_delete_pet: "删除 {name} 以及它的所有记录？此操作无法撤销。",
    ask_name: "你的宠物叫什么名字？",
    ask_species: "它是什么宠物？",
    migrated: "欢迎回来！你已有的{n}已移入名为“{name}”的宠物。你可以随时重命名或删除。",

    back_all_pets: "← 所有宠物",
    edit_details: "编辑信息",
    save: "保存",
    cancel: "取消",
    tab_chat: "对话",
    tab_log: "日志",
    tab_docs: "文档",

    new_chat: "＋ 新对话",
    del_chat_title: "删除此对话",
    your_chats: "你的对话",
    chat_ph: "问问关于 {name} 的事，或描述它做了什么…",
    send: "发送",
    greet: "和我聊聊 {name} 吧——可以问我任何问题，也可以描述它做了什么。之后你可以把任何一条消息加入日志。",
    hint_free: "随意聊天——除非你手动添加，否则不会记入日志。",
    hint_logging: "已加入 {name} 的日志——回答问题可以补充细节，或者",
    skip_rest: "跳过其余问题",
    skipped: "没问题——就先这样保留。",
    advice_pill: "建议 · 未记入日志",
    add_to_log: "＋ 加入日志",
    added_to_log: "✓ 已加入日志",
    lets_write: "我们把这件事记到 {name} 的日志里。",
    written_down: "已记入 {name} 的日志 🐾",
    confirm_del_chat: "删除此对话？已加入 {name} 日志的内容会保留。",
    new_chat_title: "新对话",

    f_behavior: "行为",
    f_trigger: "可能的诱因",
    f_when: "发生时间",
    f_duration: "持续时长",
    f_intensity: "强度（1–10）",
    f_recovery: "恢复时长",
    not_recorded: "未记录",
    thinking: "思考中…",
    thinking_btn: "生成中…",
    err_generic: "出了点问题。",
    err_unreachable: "暂时无法连接助手，请稍后再试。",

    logged_events: "已记录的事件",
    nothing_logged: "还没有 {name} 的记录。",
    create_report: "生成报告",
    dl_log: "下载日志（JSON）",
    no_entries: "还没有记录。",
    no_entries_sub: "先聊聊 {name}，然后在你发送的消息下方点击“＋ 加入日志”。",
    confirm_del_entry: "删除这条记录？它来自的对话会保留。",
    trigger_label: "诱因",
    save_to_docs: "保存到文档",
    saved_check: "已保存 ✓",
    dl_txt: "下载 .txt",
    close_report: "关闭报告",
    patterns_noticed: "发现的规律",

    add_note: "添加笔记",
    note_title_ph: "标题（例如：7月12日看兽医）",
    note_body_ph: "任何你想记住的事——看兽医、用药、饮食变化…",
    save_note: "保存笔记",
    attach: "添加附件",
    attach_hint: "文件（照片、兽医单据）只保存在此浏览器中。",
    no_docs: "还没有文档。",
    no_docs_sub: "在上面保存报告或写一条笔记。",
    doc_report: "报告",
    doc_note: "笔记",
    note_fallback: "笔记",
    read: "查看",
    download: "下载",
    confirm_del_doc: "删除“{title}”？",
    pet_note: "仅保存在此浏览器中。这是你观察到的记录——绝不是诊断。如有任何担心，请咨询兽医。",

    report_title: "行为观察报告 —— {name}",
    report_generated: "生成于 {d}",
    report_based: "基于{n}。",
    report_span: "记录时间范围：{a} 至 {b}。",
    report_disclaimer: "这是对所记录内容的观察性总结——不是医疗文件。",
  },
};

function getLang() {
  const saved = localStorage.getItem("lang");
  if (saved === "en" || saved === "zh") return saved;
  return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}
function setLang(l) {
  localStorage.setItem("lang", l);
  location.reload();
}

function t(key, vars) {
  const dict = I18N[getLang()] || I18N.en;
  let s = dict[key] ?? I18N.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

// Counts: English pluralizes, Chinese uses measure words.
function nEntries(n) { return getLang() === "zh" ? `${n} 条记录` : `${n} ${n === 1 ? "entry" : "entries"}`; }
function nDocs(n) { return getLang() === "zh" ? `${n} 份文档` : `${n} ${n === 1 ? "document" : "documents"}`; }
function nEvents(n) { return getLang() === "zh" ? `${n} 个事件` : `${n} logged ${n === 1 ? "event" : "events"}`; }

function fmtDate(iso) {
  const locale = getLang() === "zh" ? "zh-CN" : undefined;
  try { return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return iso; }
}
function fmtDateLong(d) {
  const locale = getLang() === "zh" ? "zh-CN" : undefined;
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

// Applies translations to any element tagged with data-i18n / -ph / -title.
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-title]").forEach(el => { el.title = t(el.dataset.i18nTitle); });
  if (document.body.dataset.titleKey) document.title = t(document.body.dataset.titleKey);
}

// The EN / 中文 switch, rendered into #langSwitch.
function renderLangSwitch() {
  const el = document.getElementById("langSwitch");
  if (!el) return;
  const lang = getLang();
  el.className = "langswitch";
  el.innerHTML = "";
  for (const [code, label] of [["en", "English"], ["zh", "中文"]]) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.className = code === lang ? "active" : "";
    b.onclick = () => { if (code !== lang) setLang(code); };
    el.appendChild(b);
  }
}

document.addEventListener("DOMContentLoaded", () => { applyI18n(); renderLangSwitch(); });
