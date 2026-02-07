<script>
  const leads = [
    { name: "Uliana Ronska", photo: "/2026/organisers/uliana-ronska.jpg", url: "https://ulianaronska.com" },
    { name: "James Leung", photo: "/2026/organisers/james-leung.jpg", url: "https://leung.dev" },
  ];

  const members = [
    { name: "Jadon Mensah", photo: "/2026/organisers/jadon-mensah.jpg", url: null },
    { name: "Kotaro Yoshizawa", photo: "/2026/organisers/kotaro-yoshizawa.jpg", url: "https://github.com/Raifa21" },
    { name: "Sophie Guenroc", photo: "/2026/organisers/sophie-guenroc.jpg", url: null },
    { name: "Alex Pylypenko", photo: "/2026/organisers/alex-pylypenko.jpg", url: null },
  ];

  const artwork = ["Ariane Dufour", "Amelie Roseblade", "Gwen Sellers"];
</script>

<div class="organisers-section">
  <h2 class="title">Organising Committee</h2>

  <!-- Lead organisers -->
  <div class="card-row leads">
    {#each leads as person}
      {#if person.url}
        <a href={person.url} target="_blank" rel="noopener noreferrer" class="card lead-card">
          <div class="photo-frame lead-frame">
            <img src={person.photo} alt={person.name} class="photo" />
          </div>
          <span class="name">{person.name}</span>
        </a>
      {:else}
        <div class="card lead-card">
          <div class="photo-frame lead-frame">
            <img src={person.photo} alt={person.name} class="photo" />
          </div>
          <span class="name">{person.name}</span>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Other committee members -->
  <div class="card-row members">
    {#each members as person}
      {#if person.url}
        <a href={person.url} target="_blank" rel="noopener noreferrer" class="card">
          <div class="photo-frame">
            <img src={person.photo} alt={person.name} class="photo" />
          </div>
          <span class="name">{person.name}</span>
        </a>
      {:else}
        <div class="card">
          <div class="photo-frame">
            <img src={person.photo} alt={person.name} class="photo" />
          </div>
          <span class="name">{person.name}</span>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Special thanks -->
  <div class="thanks">
    <h3 class="thanks-title">Special Thanks</h3>
    <p class="note">— artwork —</p>
    <ul class="thanks-list">
      {#each artwork as person}
        <li>{person}</li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .organisers-section {
    max-width: 600px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
    text-align: center;
  }

  .title {
    font-size: 1.4rem;
    color: #3d2914;
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  /* Card grid rows */
  .card-row {
    display: grid;
    justify-items: center;
    gap: 1.5rem;
    margin-bottom: 1.75rem;
  }

  .leads {
    grid-template-columns: repeat(2, 140px);
    justify-content: center;
    gap: 1.5rem;
  }

  .members {
    grid-template-columns: repeat(4, 1fr);
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.2s ease;
  }

  .card:hover {
    transform: translateY(-3px);
  }

  /* Photo frames */
  .photo-frame {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #3d2914;
    background: #e8e0d4;
    box-shadow: 0 2px 8px rgba(61, 41, 20, 0.12);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover .photo-frame {
    border-color: #7a6b5a;
    box-shadow: 0 4px 14px rgba(61, 41, 20, 0.18);
  }

  a.card {
    text-decoration: none;
    cursor: pointer;
  }

  .lead-frame {
    width: 120px;
    height: 120px;
    border-width: 3px;
  }

  .photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Names */
  .name {
    color: #3d2914;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .lead-card .name {
    font-size: 1.05rem;
    white-space: nowrap;
  }

  /* Member names: same wrap so layout stays aligned */
  .members .name {
    width: 6.5em;
    min-height: 2.4em;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Special thanks */
  .thanks {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(61, 41, 20, 0.1);
  }

  .thanks-title {
    font-size: 1rem;
    color: #7a6b5a;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  .note {
    font-size: 0.8rem;
    color: #a89880;
    margin-top: 0;
    margin-bottom: 0.5rem;
    letter-spacing: 0.1em;
  }

  .thanks-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0;
  }

  .thanks-list li {
    color: #5a4a3a;
    font-size: 0.95rem;
    margin-bottom: 0;
  }

  .thanks-list li::after {
    content: "·";
    margin: 0 0.6rem;
    color: #f05663;
  }

  .thanks-list li:last-child::after {
    content: "";
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 540px) {
    .card-row {
      gap: 1.25rem 1.5rem;
    }

    .leads {
      grid-template-columns: repeat(2, 140px);
      gap: 1.25rem 1.5rem;
    }

    .members {
      grid-template-columns: repeat(2, 140px);
      justify-content: center;
      gap: 1.25rem 1.5rem;
    }

    .photo-frame {
      width: 80px;
      height: 80px;
    }

    .lead-frame {
      width: 100px;
      height: 100px;
    }

    .name {
      font-size: 0.85rem;
    }

    .lead-card .name {
      font-size: 0.95rem;
    }

    .card:hover {
      transform: none;
    }

    .card:hover .photo-frame {
      border-color: #3d2914;
      box-shadow: 0 2px 8px rgba(61, 41, 20, 0.12);
    }
  }
</style>
