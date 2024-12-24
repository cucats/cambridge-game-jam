<script>
    let { imageUrls } = $props();
</script>

<div class="gallery">
    {#each imageUrls as imageUrl}
        <img src={imageUrl} alt="" />
    {/each}
</div>

<style>
    .gallery {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        padding: 16px;
    }

    img {
        width: calc(33.333% - 16px); /* Adjust the width as needed */
        height: auto;
        object-fit: contain;
        display: block;
    }

    @media (max-width: 768px) {
        img {
            width: calc(50% - 16px); /* Adjust the width as needed */
        }
    }
</style>
