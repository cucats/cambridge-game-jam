<script>
  let { title, startDate, endDate, url } = $props();
</script>

<a href={url} class="card-link">
  <div class="card">
    <h2 class="card-title">{title}</h2>
    <p class="card-date">{startDate}&nbsp;&ndash;&nbsp;{endDate}</p>
    <span class="card-arrow">→</span>
  </div>
</a>

<style>
  .card-link {
    text-decoration: none;
    display: block;
  }

  .card {
    background: #ffe7a8;
    border: 4px solid #3d2914;
    padding: 1.5rem;
    box-shadow: 4px 4px 0 #3d2914;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
    position: relative;
  }

  .card:hover {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #3d2914;
  }

  .card:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #3d2914;
  }

  .card-title {
    font-family: "Peaberry Base", monospace;
    font-size: 1.25rem;
    color: #1a1c1e;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  .card-date {
    font-family: "Peaberry Base", monospace;
    font-size: 0.9rem;
    color: #3d2914;
    margin: 0;
  }

  .card-arrow {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    font-size: 1.25rem;
    color: #f05663;
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .card:hover .card-arrow {
    opacity: 1;
    transform: translateX(0);
  }
</style>
