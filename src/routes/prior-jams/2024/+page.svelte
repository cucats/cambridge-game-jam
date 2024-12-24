<script>
    import Gallery from "../../../lib/components/prior-jams/Gallery.svelte";
    let imageUrls = [
        "https://github.gallerycdn.vsassets.io/extensions/github/copilot/1.254.1278/1734970099046/Microsoft.VisualStudio.Services.Icons.Default",
        "https://github.com/microsoft/vscode-copilot-release/blob/main/images/readme-gif.gif?raw=true",
        "https://code.visualstudio.com/assets/docs/copilot/inline-suggestions/js-suggest.png",
        "https://code.visualstudio.com/assets/docs/copilot/copilot-chat/copilot-view.png",
        "https://code.visualstudio.com/assets/docs/copilot/copilot-chat/inline-chat-question-example.png",
        "https://github.com/microsoft/vscode-copilot-release/blob/main/images/participants-workspace.gif?raw=true",
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.m2poQAuK0hsDRyNTk3KiawHaLD%26pid%3DApi&f=1&ipt=5f24d59d64874bda974a4cac6a4a6975b5b0c9084508e845031e3d1c48fd5e2f&ipo=images",
        "https://github.com/microsoft/vscode-copilot-release/blob/main/images/participants-terminal.gif?raw=true",
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.Fq08S4boDR5zLwHjN7aN4gHaKC%26pid%3DApi&f=1&ipt=24222aa81c32cf98448abdc40bfb2bb08b8ff692994caf06ab41759d79b536f8&ipo=images",
    ];
</script>

<Gallery {imageUrls} />
