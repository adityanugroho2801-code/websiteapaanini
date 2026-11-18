const tiles = [
  { g: "Mesin", n: "Suhu Mesin 1", v: "68 °C", k: "t1" },
  { n: "Tekanan Mesin 2", v: "4,8 bar", k: "p2", p: 1 },
  { g: "Lini", n: "Kecepatan konveyor", v: "120 botol/mnt", k: "c" },
  { n: "Level cairan", v: "82 %", k: "l" },
  { n: "Suhu Mesin 3", v: "71 °C", k: "t3" },
  { n: "Jumlah botol hari ini", v: "8.420", k: "j" },
];

const panel = document.getElementById("panel");
const grid = document.getElementById("grid");
let mode = "ergo";
let alerting = false;
let startedAt = 0;
let busy = false;
let timers = [];

function build() {
  grid.textContent = "";

  tiles.forEach(function (tile) {
    if (tile.g) {
      const group = document.createElement("div");
      group.className = "group";
      group.textContent = tile.g;
      grid.appendChild(group);
    }

    const element = document.createElement("div");
    element.className = "tile";
    element.id = "t_" + tile.k;
    element.innerHTML =
      '<div class="n"></div><div class="v"></div>' +
      '<span class="chip">✓ Normal</span><span class="small">OK</span>' +
      (tile.p ? '<button class="fix" id="fix">Atur</button>' : "");
    element.querySelector(".n").textContent = tile.n;
    element.querySelector(".v").textContent = tile.v;
    grid.appendChild(element);
  });

  const fixButton = document.getElementById("fix");
  if (fixButton) fixButton.onclick = handle;
}

function setPressed(activeButton, inactiveButton, isActive) {
  activeButton.setAttribute("aria-pressed", isActive);
  inactiveButton.setAttribute("aria-pressed", !isActive);
}

function setMode(newMode) {
  mode = newMode;
  reset();
  panel.className = "panel " + (newMode === "ergo" ? "v-ergo" : "v-awal");
  setPressed(
    document.getElementById("bErgo"),
    document.getElementById("bAwal"),
    newMode === "ergo",
  );
}

function setStep(activeStep) {
  const steps = document.querySelectorAll(".step");
  steps.forEach(function (step, index) {
    step.classList.toggle("on", index === activeStep);
  });
}

function setCaption(text) {
  document.getElementById("cap").textContent = text;
}

function setTile(isBad) {
  const tile = document.getElementById("t_p2");
  tile.classList.toggle("bad", isBad);
  tile.querySelector(".v").textContent = isBad ? "7,5 bar" : "4,8 bar";
  tile.querySelector(".chip").textContent = isBad ? "⚠ Bahaya" : "✓ Normal";
  tile.querySelector(".small").textContent = isBad ? "Batas 6,5" : "OK";
}

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  alerting = false;
  busy = false;
  panel.classList.remove("alerting");
  build();
  setStep(-1);
  setCaption("Tekan “Simulasikan peringatan” untuk menjalankan alur.");
  document.getElementById("run").disabled = false;
}

function later(callback, delay) {
  timers.push(setTimeout(callback, delay));
}

function run() {
  if (busy) return;

  reset();
  busy = true;
  document.getElementById("run").disabled = true;
  setStep(0);
  setCaption("Input: sensor mengirim pembacaan tekanan Mesin 2 sebesar 7,5 bar.");

  later(function () {
    setStep(1);
    setCaption(
      "Proses: sistem membandingkan 7,5 bar dengan batas aman 6,5 bar. Hasilnya melewati batas.",
    );
  }, 1200);

  later(function () {
    setStep(2);
    setTile(true);
    alerting = true;
    panel.classList.add("alerting");
    startedAt = performance.now();
    setCaption(
      mode === "ergo"
        ? "Output: banner peringatan tampil di bagian atas. Tekan “Kurangi tekanan”."
        : "Output: nilai Mesin 2 berubah. Temukan dan tekan “Atur”.",
    );
  }, 2600);
}

function handle() {
  if (!alerting) return;

  const responseTime = ((performance.now() - startedAt) / 1000)
    .toFixed(1)
    .replace(".", ",") + " detik";
  const resultId = mode === "ergo" ? "rErgo" : "rAwal";
  document.getElementById(resultId).textContent = responseTime;
  alerting = false;
  panel.classList.remove("alerting");
  setStep(3);
  setTile(false);
  setCaption(
    "Umpan balik: tekanan turun ke 4,8 bar dan status kembali Normal. Waktu respons Anda " +
      responseTime +
      ".",
  );
  busy = false;
  document.getElementById("run").disabled = false;
}

document.getElementById("bAwal").onclick = function () {
  setMode("awal");
};
document.getElementById("bErgo").onclick = function () {
  setMode("ergo");
};
document.getElementById("bBaru").onclick = function () {
  setPressed(this, document.getElementById("bAhli"), true);
  document.getElementById("guide").style.display = "";
};
document.getElementById("bAhli").onclick = function () {
  setPressed(this, document.getElementById("bBaru"), true);
  document.getElementById("guide").style.display = "none";
};
document.getElementById("run").onclick = run;
document.getElementById("act").onclick = handle;
build();