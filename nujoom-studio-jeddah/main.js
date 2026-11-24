// Preview build: no storage, no network calls of our own. After approval, set WA to the studio's WhatsApp number.
const WA = "";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// RTL date fix
document.querySelectorAll("input[type=date]").forEach((d) => {
  const toText = () => { if (!d.value) { d.type = "text"; d.placeholder = "اختر التاريخ"; } };
  d.addEventListener("focus", () => { if (d.type !== "date") { d.type = "date"; try { d.showPicker(); } catch {} } });
  d.addEventListener("blur", toText); toText();
});

// Reveal
const io = "IntersectionObserver" in window && !reduce ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

// Wedding-night timeline — offsets in minutes relative to the zaffa (planning suggestion only)
const STEPS = [
  { off: -180, t: "بداية تصوير التجهيز", d: "الفستان والتفاصيل وصور العروس الهادئة", k: "prep" },
  { off: -120, t: "صور التفاصيل", d: "الدبل، الطرحة، الورد، والحذاء", k: "prep" },
  { off: -75, t: "صور العائلة", d: "الأم والأخوات والقريبات قبل ازدحام القاعة", k: "fam" },
  { off: -20, t: "تجهيز الدخول", d: "تثبيت الإضاءة والزوايا عند الممر", k: null },
  { off: 0, t: "الزفّة", d: "لحظة الدخول، أهم دقائق الليلة", k: null, key: true },
  { off: 30, t: "الكوشة", d: "صور العروس على الكوشة ومع المقربين", k: null },
  { off: 75, t: "صور جماعية", d: "الصديقات والعائلة في مجموعات", k: null },
];
const fmt = (mins) => {
  mins = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60), m = mins % 60, h12 = ((h + 11) % 12) + 1;
  return `${h12.toLocaleString("ar-SA")}:${String(m).padStart(2, "0").replace(/\d/g, (x) => "٠١٢٣٤٥٦٧٨٩"[x])} ${h < 12 ? "ص" : "م"}`;
};
const z = document.getElementById("zaffa"), list = document.getElementById("tl-list");
const prep = document.getElementById("t-prep"), fam = document.getElementById("t-fam");
let lastPlan = [];
function build() {
  const [hh, mm] = (z.value || "22:30").split(":").map(Number), base = hh * 60 + mm;
  const steps = STEPS.filter((s) => (s.k === "prep" ? prep.checked : s.k === "fam" ? fam.checked : true));
  lastPlan = steps.map((s) => `${fmt(base + s.off)} — ${s.t}`);
  list.replaceChildren(...steps.map((s) => {
    const li = document.createElement("li"); if (s.key) li.className = "key";
    const t = document.createElement("time"); t.textContent = fmt(base + s.off);
    const d = document.createElement("div"); const b = document.createElement("b"); b.textContent = s.t;
    const sp = document.createElement("span"); sp.textContent = s.d; d.append(b, sp);
    li.append(t, d); return li;
  }));
}
[z, prep, fam].forEach((el) => el.addEventListener("input", build));
build();

// Open now (Riyadh time zone covers Jeddah): daily 07:00–24:00, Friday 16:30–24:00
const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
const m = now.getHours() * 60 + now.getMinutes(), open = now.getDay() === 5 ? 990 : 420;
const st = document.getElementById("status"), stt = document.getElementById("st");
if (m >= open) { st.classList.add("open"); stt.textContent = "مفتوح الآن · حتى منتصف الليل"; }
else { st.classList.add("closed"); stt.textContent = `مغلق الآن · يفتح ${now.getDay() === 5 ? "٤:٣٠ عصراً" : "٧ صباحاً"}`; }

// Booking → WhatsApp preview (includes the planned timeline)
const bf = document.getElementById("bf");
bf.addEventListener("submit", (e) => {
  e.preventDefault();
  const day = bf.elements.day, err = document.getElementById("err");
  if (!day.value) { err.hidden = false; day.setAttribute("aria-invalid", "true"); day.focus(); return; }
  err.hidden = true; day.removeAttribute("aria-invalid");
  const d = new Date(day.value + "T12:00").toLocaleDateString("ar-SA-u-ca-gregory", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hall = bf.elements.hall.value.trim();
  const msg = ["السلام عليكم، أبغى أحجز تصوير فرح.", `التاريخ: ${d}`, hall ? `القاعة: ${hall}` : null, `المطلوب: ${bf.querySelector("input[name=cov]:checked").value}`, "", "الجدول المقترح:", ...lastPlan].filter((x) => x !== null).join("\n");
  if (WA) { window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener"); return; }
  document.getElementById("msg").textContent = msg;
  const o = document.getElementById("out"); o.hidden = false; o.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
});
