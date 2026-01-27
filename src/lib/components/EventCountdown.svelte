<script>
  let { registrationClose, jamStart, jamEnd } = $props();

  const toDate = (v) => (v instanceof Date ? v : new Date(v));

  let label = $state("");
  let dt = $state(0);

  function pickTarget(now) {
    const r = registrationClose ? toDate(registrationClose).getTime() : null;
    const s = jamStart ? toDate(jamStart).getTime() : null;
    const e = jamEnd ? toDate(jamEnd).getTime() : null;

    let target = now;
    let text = "";

    if (r && now < r) {
      target = r;
      text = "REGISTRATION CLOSES IN";
    } else if (s && now < s) {
      target = s;
      text = "STARTING IN";
    } else if (e && now < e) {
      target = e;
      text = "ENDS IN";
    } else {
      target = now;
      text = "ENDED";
    }
    return { target, text };
  }

  function updateCountdown() {
    const now = Date.now();
    const { target, text } = pickTarget(now);
    label = text;
    dt = Math.max(0, Math.floor((target - now) / 1000));
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  updateCountdown();

  $effect(() => {
    if (typeof window === "undefined") return;
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  });
</script>

<div class="countdown">
  {#if label}
    <div class="label">{label}</div>
  {/if}
  <div class="timer" aria-live="polite">
    <div class="unit">
      <div class="value">{pad2(Math.floor(dt / 86400))}</div>
      <div class="name">
        {Math.floor(dt / 86400) === 1 ? "DAY" : "DAYS"}
      </div>
    </div>
    <div class="sep">:</div>
    <div class="unit">
      <div class="value">{pad2(Math.floor((dt / 3600) % 24))}</div>
      <div class="name">
        {Math.floor((dt / 3600) % 24) === 1 ? "HOUR" : "HOURS"}
      </div>
    </div>
    <div class="sep">:</div>
    <div class="unit">
      <div class="value">{pad2(Math.floor((dt / 60) % 60))}</div>
      <div class="name">
        {Math.floor((dt / 60) % 60) === 1 ? "MINUTE" : "MINUTES"}
      </div>
    </div>
    <div class="sep">:</div>
    <div class="unit">
      <div class="value">{pad2(Math.floor(dt % 60))}</div>
      <div class="name">
        {Math.floor(dt % 60) === 1 ? "SECOND" : "SECONDS"}
      </div>
    </div>
  </div>
  {#if registrationClose && Date.now() < toDate(registrationClose).getTime()}
    <a href="/signup" class="register-button">REGISTER NOW!</a>
  {/if}
</div>

<style>
  .countdown {
    display: block;
    width: 100%;
    max-width: 360px;
    box-sizing: border-box;
    margin: 0 auto;
    font-family: "Peaberry Base", monospace;
    text-align: center;
  }
  .label {
    font-size: 20px;
    margin-bottom: 6px;
  }
  .timer {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8px;
  }
  .unit {
    text-align: center;
  }
  .value {
    font-size: 40px;
    line-height: 1;
    font-weight: 700;
  }
  .name {
    font-size: 12px;
    margin-top: 2px;
    letter-spacing: 0.06em;
  }
  .sep {
    font-size: 40px;
    line-height: 1;
    padding: 0 2px;
  }

  .register-button {
    display: inline-block;
    margin-top: 48px;
    font-size: 20px;
    font-weight: 700;
    padding: 14px 28px;
    color: #1a1c1e;
    border: #1a1c1e 4px solid;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    letter-spacing: 1px;
    transition: all 0.1s ease;
    image-rendering: pixelated;
  }

  .register-button:hover {
    transform: translate(2px, 2px);
  }

  .register-button:active {
    transform: translate(4px, 4px);
    box-shadow:
      0 0 0 #3d2914,
      inset -3px -3px 0 rgba(0, 0, 0, 0.2),
      inset 3px 3px 0 rgba(255, 255, 255, 0.2);
  }
</style>
