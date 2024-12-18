<script>
    let { title, startDate, endDate, url } = $props();
</script>

<a href={url}>
    <div class="theme-bg-gradient rounded-2xl p-4">
        <h2>{title}</h2>
        <p>{startDate}&nbsp;&ndash;&nbsp;{endDate}</p>
    </div>
</a>

<style>
    div {
        transition: 200ms;
    }
    div:hover {
        background-image: linear-gradient(120deg, #80d68c 0%, #77ceb1 100%);
    }
</style>
