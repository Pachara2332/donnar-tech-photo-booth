const screens = [...document.querySelectorAll('.screen')];
const styleScreen = document.querySelector('#styleScreen');
const paymentScreen = document.querySelector('#paymentScreen');
const cameraScreen = document.querySelector('#cameraScreen');
const resultScreen = document.querySelector('#resultScreen');
const video = document.querySelector('#cameraVideo');
const canvas = document.querySelector('#captureCanvas');
const ctx = canvas.getContext('2d');
const filterValues = {
  original: { name: 'ธรรมชาติ', css: 'brightness(1.05) contrast(1) saturate(1)' },
  soft: { name: 'ผิวออร่า', css: 'brightness(1.12) contrast(.98) saturate(1.08)' },
  warm: { name: 'อมชมพู', css: 'brightness(1.08) contrast(1.02) saturate(1.15) sepia(.08)' },
  film: { name: 'Y2K Film', css: 'brightness(.98) contrast(1.1) saturate(1.2) sepia(.12)' },
  mono: { name: 'ขาวดำ', css: 'grayscale(1) contrast(1.05)' },
};
const state = { layout: '2x3', filter: 'original', frame: 'clean', countdown: 3, stream: null, captures: [], captureTimer: null, resetTimer: null, inactivity: null, capturing: false };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function showScreen(screen) { screens.forEach((item) => item.classList.toggle('active', item === screen)); }
function selectedCount() { return state.layout === '1x3' ? 3 : 6; }
function price() { return state.layout === '1x3' ? 100 : 120; }
function resetIdleTimer() {
  clearTimeout(state.inactivity);
  if (styleScreen.classList.contains('active') || paymentScreen.classList.contains('active')) state.inactivity = setTimeout(resetSession, 90000);
}
function resetSession() {
  clearTimeout(state.captureTimer); clearTimeout(state.resetTimer);
  stopCamera(); state.captures = []; state.capturing = false;
  document.querySelector('#paymentModal').hidden = true;
  document.querySelector('#demoPay').disabled = false;
  document.querySelector('#printDemo').disabled = false;
  document.querySelector('#printDemo').innerHTML = 'พิมพ์ตัวอย่าง <span>→</span>';
  document.querySelector('#startCapture').disabled = true;
  showScreen(styleScreen); resetIdleTimer();
}
function stopCamera() {
  if (state.stream) state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null; video.srcObject = null;
}
function updatePrice() {
  document.querySelector('#priceValue').textContent = `฿${price()}`;
  document.querySelector('#priceUnit').textContent = `ต่อ 1 ครั้ง · ${selectedCount()} รูป`;
  document.querySelector('#amountValue').textContent = `฿${price().toFixed(2)}`;
  document.querySelector('#shotProgress').textContent = `พร้อมถ่าย ${selectedCount()} ภาพ`;
  updateCaptureButton();
}
function updateCaptureButton() {
  const button = document.querySelector('#startCapture');
  if (state.capturing) button.textContent = `กำลังถ่าย ${state.captures.length + 1} / ${selectedCount()}`;
  else button.innerHTML = `เริ่มถ่าย ${selectedCount()} ภาพ <span>→</span>`;
}
function setFilter(id) {
  state.filter = id;
  const preset = filterValues[id];
  video.style.filter = preset.css;
  document.querySelector('#filterLabel').textContent = `ฟิลเตอร์: ${preset.name}`;
  document.querySelectorAll('.filter').forEach((button) => button.classList.toggle('selected', button.dataset.filter === id));
  document.querySelectorAll('.camera-filter').forEach((button) => button.classList.toggle('selected', button.dataset.filter === id));
  document.querySelector('#miniStrip').dataset.filter = id;
}
function setFrame(id) {
  state.frame = id;
  const strip = document.querySelector('#miniStrip');
  strip.classList.remove('frame-clean', 'frame-pink', 'frame-blue', 'frame-flower');
  strip.classList.add(`frame-${id}`);
  document.querySelectorAll('.frame-option').forEach((button) => {
    button.classList.toggle('selected', button.dataset.frame === id);
    button.setAttribute('aria-pressed', button.dataset.frame === id ? 'true' : 'false');
  });
}
function setCountdown(seconds) {
  state.countdown = seconds;
  document.querySelectorAll('.timer-option').forEach((button) => {
    button.classList.toggle('selected', Number(button.dataset.seconds) === seconds);
    button.setAttribute('aria-pressed', Number(button.dataset.seconds) === seconds ? 'true' : 'false');
  });
  document.querySelectorAll('.camera-timer').forEach((button) => {
    button.classList.toggle('selected', Number(button.dataset.seconds) === seconds);
    button.setAttribute('aria-pressed', Number(button.dataset.seconds) === seconds ? 'true' : 'false');
  });
  updateCaptureButton();
}
function updateStripPreview() {
  const strip = document.querySelector('#miniStrip');
  const brand = document.createElement('b');
  brand.textContent = 'DONNAR · PHOTO BOOTH';
  strip.replaceChildren(...Array.from({ length: selectedCount() }, () => document.createElement('i')), brand);
}
function setCameraError(error) {
  const placeholder = document.querySelector('#cameraPlaceholder');
  placeholder.hidden = false;
  placeholder.querySelector('b').textContent = 'เปิดกล้องไม่สำเร็จ';
  placeholder.querySelector('span').textContent = error?.name === 'NotAllowedError' ? 'โปรดอนุญาตสิทธิ์กล้องในเบราว์เซอร์' : (error?.message || 'ตรวจสอบการเชื่อมต่อกล้อง');
  document.querySelector('#enableCamera').hidden = false;
  document.querySelector('#cameraBadge').textContent = 'CAMERA UNAVAILABLE';
}
async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('หน้านี้ต้องเปิดผ่าน localhost หรือ HTTPS เพื่อใช้กล้อง');
  if (state.stream?.active) return;
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }, audio: false });
  state.stream = stream;
  video.srcObject = stream;
  await video.play();
  document.querySelector('#cameraPlaceholder').hidden = true;
  document.querySelector('#enableCamera').hidden = true;
  document.querySelector('#startCapture').disabled = false;
  document.querySelector('#cameraBadge').textContent = 'LIVE · CAMERA READY';
}
async function beginCameraAfterPayment() {
  document.querySelector('#demoPay').disabled = true;
  const modal = document.querySelector('#paymentModal');
  modal.hidden = false;
  await wait(1500);
  modal.hidden = true;
  showScreen(cameraScreen);
  document.querySelector('#cameraPlaceholder').hidden = false;
  document.querySelector('#cameraPlaceholder').querySelector('b').textContent = 'กำลังเปิดกล้อง';
  document.querySelector('#cameraPlaceholder').querySelector('span').textContent = 'หากเบราว์เซอร์ถาม ให้เลือกอนุญาตกล้อง';
  document.querySelector('#enableCamera').hidden = true;
  try { await openCamera(); } catch (error) { setCameraError(error); }
}
async function captureSession() {
  if (!state.stream || state.capturing) return;
  state.captures = [];
  state.capturing = true;
  document.querySelector('#startCapture').disabled = true;
  const overlay = document.querySelector('#shotOverlay');
  const count = document.querySelector('#shotCount');
  overlay.classList.add('visible');
  for (let shot = 0; shot < selectedCount(); shot += 1) {
    document.querySelector('#shotProgress').textContent = `เตรียมภาพที่ ${shot + 1} / ${selectedCount()}`;
    for (let seconds = state.countdown; seconds > 0; seconds -= 1) {
      count.textContent = String(seconds);
      await wait(1000);
    }
    count.textContent = '●';
    const stage = document.querySelector('#cameraStage');
    stage.classList.add('flash');
    await wait(100);
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    ctx.save(); ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.filter = filterValues[state.filter].css;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); ctx.restore();
    state.captures.push(canvas.toDataURL('image/jpeg', .94));
    stage.classList.remove('flash');
    document.querySelector('#shotProgress').textContent = `ถ่ายแล้ว ${state.captures.length} / ${selectedCount()} ภาพ`;
    if (shot < selectedCount() - 1) await wait(450);
  }
  overlay.classList.remove('visible');
  state.capturing = false;
  renderResult();
  showScreen(resultScreen);
  stopCamera();
  clearTimeout(state.resetTimer);
  state.resetTimer = setTimeout(resetSession, 30000);
}
function renderResult() {
  const strip = document.querySelector('#resultStrip');
  strip.replaceChildren();
  strip.className = `result-strip ${state.layout === '2x3' ? 'wide' : ''} frame-${state.frame}`;
  state.captures.forEach((src, index) => {
    const frame = document.createElement('div'); frame.className = 'result-frame';
    const image = document.createElement('img'); image.src = src; image.alt = `ภาพที่ ${index + 1}`;
    const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0');
    frame.append(image, number); strip.append(frame);
  });
  const mark = document.createElement('div'); mark.className = 'result-brand';
  mark.innerHTML = '<b>DONNAR.TECH</b><small>PHOTO BOOTH · 2026</small>'; strip.append(mark);
}
document.querySelectorAll('.layout-option').forEach((button) => button.addEventListener('click', () => {
  state.layout = button.dataset.layout;
  document.querySelectorAll('.layout-option').forEach((item) => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', item === button ? 'true' : 'false'); });
  const mini = document.querySelector('#miniStrip'); mini.classList.toggle('wide', state.layout === '2x3'); mini.classList.toggle('narrow', state.layout === '1x3');
  updateStripPreview();
  document.querySelector('#layoutCaption').textContent = state.layout === '1x3' ? '1 × 3 นิ้ว · 3 ภาพ' : '2 × 3 นิ้ว · 6 ภาพ';
  updatePrice(); resetIdleTimer();
}));
document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => { setFilter(button.dataset.filter); resetIdleTimer(); }));
document.querySelectorAll('.camera-filter').forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));
document.querySelectorAll('.frame-option').forEach((button) => button.addEventListener('click', () => setFrame(button.dataset.frame)));
document.querySelectorAll('.timer-option').forEach((button) => button.addEventListener('click', () => setCountdown(Number(button.dataset.seconds))));
document.querySelectorAll('.camera-timer').forEach((button) => button.addEventListener('click', () => setCountdown(Number(button.dataset.seconds))));
document.querySelector('#continueBtn').addEventListener('click', () => { updatePrice(); showScreen(paymentScreen); });
document.querySelector('#editStyle').addEventListener('click', () => showScreen(styleScreen));
document.querySelector('#demoPay').addEventListener('click', beginCameraAfterPayment);
document.querySelector('#enableCamera').addEventListener('click', async () => { try { await openCamera(); } catch (error) { setCameraError(error); } });
document.querySelector('#startCapture').addEventListener('click', captureSession);
document.querySelector('#cancelCamera').addEventListener('click', resetSession);
document.querySelector('#printDemo').addEventListener('click', () => { const button = document.querySelector('#printDemo'); button.innerHTML = 'บันทึกภาพตัวอย่างแล้ว ✓'; button.disabled = true; });
document.querySelector('#newSession').addEventListener('click', resetSession);
document.addEventListener('pointerdown', resetIdleTimer);
updatePrice(); updateStripPreview(); setFrame('clean'); setCountdown(3); resetIdleTimer();
