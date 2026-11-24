// Preview build: no storage, no network calls of our own. After approval, set WA to the studio's WhatsApp number.
const WA = "";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ar = (n) => Number(n).toLocaleString("ar-SA");

// RTL date fix
document.querySelectorAll("input[type=date]").forEach((d) => {
  const toText = () => { if (!d.value) { d.type = "text"; d.placeholder = "اختاري التاريخ"; } };
  d.addEventListener("focus", () => { if (d.type !== "date") { d.type = "date"; try { d.showPicker(); } catch {} } });
  d.addEventListener("blur", toText); toText();
});

// Reveal
const io = "IntersectionObserver" in window && !reduce ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

// Session planner — general preparation advice per occasion (not studio-specific claims)
const OCC = {
  grad: { name: "التخرّج", title: "جلسة التخرّج", items: ["الروب والقبعة والوشاح", "الشهادة أو الدرع إن رغبتِ بتصويره", "باقة ورد صغيرة (اختياري)"] },
  baby: { name: "المواليد", title: "جلسة المولود", items: ["بطانية ناعمة وملابس قطنية بسيطة", "رضعة قبل الجلسة بوقت قصير", "حفاضات ومناديل إضافية"] },
  mlk: { name: "الملكة والخطوبة", title: "جلسة الملكة", items: ["الدبلة والإكسسوارات في علبتها", "طرحة أو قطعة رأس إن وُجدت", "صورة مرجعية للأسلوب الذي تحبينه"] },
  solo: { name: "جلسة شخصية", title: "جلستكِ الشخصية", items: ["إطلالة بألوان سادة تبرز ملامحكِ", "إكسسوارات بسيطة غير لامعة", "صور مرجعية لوضعيات تعجبكِ"] },
  fam: { name: "عائلية", title: "الجلسة العائلية", items: ["ألوان متناسقة لكل العائلة", "لعبة صغيرة أو حلوى للأطفال", "وصول الجميع في الوقت نفسه"] },
};
const state = { occ: "grad", ppl: 1, outs: 1 };
const pills = document.getElementById("occ-pills");
Object.entries(OCC).forEach(([k, v], i) => {
  const l = document.createElement("label");
  const r = Object.assign(document.createElement("input"), { type: "radio", name: "occ", value: k, checked: i === 0 });
  r.addEventListener("change", () => { state.occ = k; render(); });
  l.append(r, Object.assign(document.createElement("span"), { textContent: v.name })); pills.append(l);
});
document.querySelectorAll(".stepper button").forEach((b) => b.addEventListener("click", () => {
  const t = b.dataset.t, max = t === "ppl" ? 8 : 4;
  state[t] = Math.min(max, Math.max(1, state[t] + Number(b.dataset.d))); render();
}));
function planLines() {
  const o = OCC[state.occ], extra = [];
  if (state.outs > 1) extra.push(`${state.outs === 2 ? "إطلالتان" : `${ar(state.outs)} إطلالات`}: علّقيها بالترتيب الذي ستصوّرينه`);
  if (state.ppl > 1) extra.push(`${state.ppl === 2 ? "شخصان" : `${ar(state.ppl)} أشخاص`}: نسّقوا الألوان مسبقاً`);
  return { title: o.title, base: o.items, extra };
}
function render() {
  document.getElementById("ppl").textContent = ar(state.ppl);
  document.getElementById("outs").textContent = ar(state.outs);
  const p = planLines();
  document.getElementById("card-title").textContent = p.title;
  document.getElementById("card-list").replaceChildren(
    ...p.base.map((t) => Object.assign(document.createElement("li"), { textContent: t })),
    ...p.extra.map((t) => Object.assign(document.createElement("li"), { textContent: t, className: "hi" }))
  );
}
render();

// Open now (Riyadh): Sat–Thu 16:00–23:00, Friday closed
const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
const m = now.getHours() * 60 + now.getMinutes(), fri = now.getDay() === 5;
const st = document.getElementById("status"), stt = document.getElementById("st");
if (!fri && m >= 960 && m < 1380) { st.classList.add("open"); stt.textContent = "مفتوح الآن · حتى ١١ مساءً"; }
else { st.classList.add("closed"); stt.textContent = fri ? "مغلق اليوم · يفتح السبت ٤ عصراً" : m < 960 ? "مغلق الآن · يفتح اليوم ٤ عصراً" : now.getDay() === 4 ? "مغلق الآن · يفتح السبت ٤ عصراً" : "مغلق الآن · يفتح غداً ٤ عصراً"; }

// Booking → WhatsApp preview (includes planner choices)
const bf = document.getElementById("bf");
bf.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = bf.elements.name.value.trim(), day = bf.elements.day.value, err = document.getElementById("err");
  if (!name || !day) { err.hidden = false; (name ? bf.elements.day : bf.elements.name).focus(); return; }
  err.hidden = true;
  const d = new Date(day + "T12:00").toLocaleDateString("ar-SA-u-ca-gregory", { weekday: "long", day: "numeric", month: "long" });
  const msg = ["السلام عليكم، أبغى أحجز جلسة تصوير.", `الاسم: ${name}`, `المناسبة: ${OCC[state.occ].name}`, `عدد الأشخاص: ${ar(state.ppl)}`, `عدد الإطلالات: ${ar(state.outs)}`, `اليوم: ${d}`].join("\n");
  if (WA) { window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener"); return; }
  document.getElementById("msg").textContent = msg;
  const o = document.getElementById("out"); o.hidden = false; o.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
});
