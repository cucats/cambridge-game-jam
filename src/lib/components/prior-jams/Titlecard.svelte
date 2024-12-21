<script>
    let { title, startDate, endDate, url } = $props();
</script>

<a href={url}>
    <div class="bg-gradient-to-br from-rose-400 to-red-300 hover:from-rose-500 hover:to-red-400 rounded-2xl p-4">
        <h2>{title}</h2>
        <p>{startDate}&nbsp;&ndash;&nbsp;{endDate}</p>
    </div>
</a>

<style>
    div {
        transition: 200ms;
    }
</style>
