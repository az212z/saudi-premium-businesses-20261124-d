// Preview build: no network calls of our own, no storage. After approval, set WA to the studio's WhatsApp number.
const WA = "";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ar = (n, d = 0) => Number(n).toLocaleString("ar-SA", { maximumFractionDigits: d, minimumFractionDigits: d });

// RTL date fix: Chrome renders the empty date placeholder reversed in Arabic locales.
document.querySelectorAll("input[type=date]").forEach((d) => {
  const toText = () => { if (!d.value) { d.type = "text"; d.placeholder = "اختر التاريخ"; } };
  d.addEventListener("focus", () => { if (d.type !== "date") { d.type = "date"; try { d.showPicker(); } catch {} } });
  d.addEventListener("blur", toText); toText();
});

// Mobile menu
const menu = document.querySelector(".menu"), mnav = document.getElementById("mnav");
menu.addEventListener("click", () => { const o = menu.getAttribute("aria-expanded") === "true"; menu.setAttribute("aria-expanded", String(!o)); mnav.hidden = o; });
mnav.addEventListener("click", (e) => { if (e.target.tagName === "A") { mnav.hidden = true; menu.setAttribute("aria-expanded", "false"); } });

// Reveal on scroll
const io = "IntersectionObserver" in window && !reduce ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

// Print size calculator (cm = px / dpi * 2.54)
const SIZES = [[10, 15], [13, 18], [20, 30], [30, 40], [40, 60], [50, 70]];
const pw = document.getElementById("pw"), ph = document.getElementById("ph"), res = document.getElementById("res"), list = document.getElementById("sizes");
function calc() {
  const w = Math.max(+pw.value || 0, +ph.value || 0), h = Math.min(+pw.value || 0, +ph.value || 0);
  if (w < 100 || h < 100) { res.textContent = "أدخل أبعاداً صحيحة بالبكسل."; list.replaceChildren(); return; }
  const cm = (px, dpi) => (px / dpi) * 2.54;
  const L300 = cm(w, 300), S300 = cm(h, 300), L150 = cm(w, 150), S150 = cm(h, 150);
  res.innerHTML = "";
  const b1 = document.createElement("b"); b1.textContent = `${ar(S300, 0)} × ${ar(L300, 0)} سم`;
  const b2 = document.createElement("b"); b2.textContent = `${ar(S150, 0)} × ${ar(L150, 0)} سم`;
  res.append("جودة ممتازة حتى ", b1, document.createElement("br"), "وجودة مقبولة حتى ", b2);
  list.replaceChildren(...SIZES.map(([a, bb]) => {
    const li = document.createElement("li");
    const fitsGood = bb <= L300 + 0.5 && a <= S300 + 0.5, fitsOk = bb <= L150 + 0.5 && a <= S150 + 0.5;
    li.className = fitsGood ? "ok" : fitsOk ? "meh" : "no";
    const name = document.createElement("span"); name.textContent = `${ar(a)} × ${ar(bb)} سم`;
    const bar = document.createElement("span"); bar.className = "bar";
    const fill = document.createElement("i"); fill.style.width = `${Math.min(100, (L150 / bb) * 50)}%`; bar.append(fill);
    const v = document.createElement("span"); v.className = "verdict"; v.textContent = fitsGood ? "ممتازة" : fitsOk ? "مقبولة" : "لا يُنصح";
    li.append(name, bar, v); return li;
  }));
}
document.querySelectorAll(".presets button").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll(".presets button").forEach((x) => x.classList.toggle("on", x === b));
  pw.value = b.dataset.w; ph.value = b.dataset.h; calc();
}));
[pw, ph].forEach((i) => i.addEventListener("input", () => { document.querySelectorAll(".presets button").forEach((x) => x.classList.remove("on")); calc(); }));
calc();

// Open-now status for branches with confirmed hours (Riyadh time; minutes from midnight)
const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
const mins = now.getHours() * 60 + now.getMinutes();
document.querySelectorAll(".status[data-open]").forEach((s) => {
  const open = now.getDay() === 5 ? +s.dataset.fri : +s.dataset.open, close = +s.dataset.close;
  const on = mins >= open && mins < close;
  s.classList.add(on ? "open" : "closed");
  s.querySelector(".st").textContent = on ? "مفتوح الآن · حتى منتصف الليل" : "مغلق الآن";
});

// Gallery filter
document.querySelectorAll(".filters button").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll(".filters button").forEach((x) => x.classList.toggle("on", x === b));
  document.querySelectorAll("#grid figure").forEach((f) => f.classList.toggle("hide", b.dataset.f !== "all" && f.dataset.c !== b.dataset.f));
}));

// Booking → WhatsApp message preview
const form = document.getElementById("f"), day = form.elements.day;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const err = document.getElementById("err");
  if (!day.value) { err.hidden = false; day.setAttribute("aria-invalid", "true"); day.focus(); return; }
  err.hidden = true; day.removeAttribute("aria-invalid");
  const d = new Date(day.value + "T12:00").toLocaleDateString("ar-SA-u-ca-gregory", { weekday: "long", day: "numeric", month: "long" });
  const msg = ["السلام عليكم، أبغى أحجز.", `الخدمة: ${form.elements.svc.value}`, `الفرع: ${form.elements.br.value}`, `اليوم: ${d}`].join("\n");
  if (WA) { window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener"); return; }
  document.getElementById("msg").textContent = msg;
  const o = document.getElementById("out"); o.hidden = false; o.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
});
