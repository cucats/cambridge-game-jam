<script>
  let { title, prize = "", link, index, activeIndex, onActivate, onDeactivate } = $props();
  let hasImage = $state(true);
</script>

<a
  href={link}
  class="card"
  onmouseenter={() => onActivate?.(index)}
  onmouseleave={() => onDeactivate?.()}
  onfocus={() => onActivate?.(index)}
  onblur={() => onDeactivate?.()}
  aria-label="Lorem ipsum"
>
  <div class="thumb">
    <img
      src={"/2023/" + title.toLowerCase().replaceAll(" ", "-").replaceAll(":", "").replaceAll("'", "") + ".png"}
      alt={title}
      class="thumb-img"
      style:display={hasImage ? "block" : "none"}
      onerror={() => (hasImage = false)}
      loading="lazy"
      decoding="async"
    />
    <div class="thumb-fallback" style:opacity={hasImage ? 0 : 1}></div>
    <div class="sheen"></div>
  </div>

  <div class="meta">
    <div class="t">{title}</div>
    {#if prize}
      <div class="p">{prize}</div>
    {/if}
  </div>

  <div class="active" style:opacity={activeIndex === index ? 1 : 0}></div>
</a>

<style>
  .card {
    position: relative;
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 12px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 16px;
    text-decoration: none;
    color: rgba(235, 252, 255, 0.92);
    background: rgba(6, 10, 14, 0.38);
    border: 1px solid rgba(150, 240, 255, 0.14);
    box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(10px) saturate(130%);
    -webkit-backdrop-filter: blur(10px) saturate(130%);
    transform: translateZ(0);
    transition:
      transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1),
      border-color 240ms ease,
      background 240ms ease,
      box-shadow 240ms ease;
    overflow: hidden;
  }

  .card:hover,
  .card:focus-visible {
    transform: translateY(-2px) scale(1.01);
    border-color: rgba(125, 250, 255, 0.32);
    background: rgba(8, 14, 18, 0.5);
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(120, 255, 245, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
    outline: none;
  }

  .thumb {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    position: relative;
    overflow: hidden;
    background: radial-gradient(120px 90px at 30% 25%, rgba(110, 255, 245, 0.55), rgba(0, 0, 0, 0)),
      radial-gradient(100px 110px at 65% 80%, rgba(255, 95, 55, 0.35), rgba(0, 0, 0, 0)),
      linear-gradient(135deg, rgba(7, 10, 14, 0.85), rgba(12, 18, 26, 0.85));
    border: 1px solid rgba(150, 240, 255, 0.14);
    box-shadow:
      inset 0 0 0 1px rgba(0, 0, 0, 0.35),
      0 10px 24px rgba(0, 0, 0, 0.35);
  }

  .thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(1.15) contrast(1.12);
    transform: scale(1.06);
    transition: transform 260ms ease;
  }

  .card:hover .thumb-img,
  .card:focus-visible .thumb-img {
    transform: scale(1.12);
  }

  .thumb-fallback {
    position: absolute;
    inset: 0;
    opacity: 0;
    background:
      radial-gradient(70px 50px at 30% 20%, rgba(90, 255, 245, 0.55), rgba(0, 0, 0, 0)),
      radial-gradient(60px 70px at 70% 70%, rgba(255, 115, 65, 0.35), rgba(0, 0, 0, 0)),
      conic-gradient(from 190deg at 50% 50%, rgba(20, 30, 42, 0.9), rgba(8, 10, 14, 0.9), rgba(20, 30, 42, 0.9));
    filter: blur(0.2px);
  }

  .sheen {
    position: absolute;
    inset: -40%;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0), rgba(180, 255, 250, 0.22), rgba(255, 255, 255, 0));
    transform: translateX(-30%) rotate(10deg);
    opacity: 0;
    transition: opacity 220ms ease;
    mix-blend-mode: screen;
  }

  .card:hover .sheen,
  .card:focus-visible .sheen {
    opacity: 1;
    animation: sweep 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  @keyframes sweep {
    from {
      transform: translateX(-35%) rotate(12deg);
    }
    to {
      transform: translateX(35%) rotate(12deg);
    }
  }

  .meta {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .t {
    font-size: 14px;
    letter-spacing: 0.02em;
    font-weight: 650;
    line-height: 1.15;
    text-shadow: 0 0 24px rgba(120, 255, 245, 0.25);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p {
    font-size: 12px;
    letter-spacing: 0.04em;
    color: rgba(245, 220, 210, 0.9);
    text-shadow: 0 0 18px rgba(255, 110, 70, 0.22);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .active {
    position: absolute;
    inset: -1px;
    border-radius: 16px;
    pointer-events: none;
    background:
      radial-gradient(180px 90px at 15% 20%, rgba(120, 255, 245, 0.16), rgba(0, 0, 0, 0)),
      radial-gradient(220px 120px at 85% 80%, rgba(255, 120, 70, 0.12), rgba(0, 0, 0, 0));
    box-shadow:
      inset 0 0 0 1px rgba(140, 255, 250, 0.22),
      0 0 0 1px rgba(255, 140, 90, 0.14);
    transition: opacity 180ms ease;
  }
</style>
