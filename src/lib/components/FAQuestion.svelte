<script>
  import { slide } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [question]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { question, children } = $props();

  let expanded = $state(false);
</script>

<div class="faq-item">
  <button class="faq-question" onclick={() => (expanded = !expanded)}>
    <span class="question-icon">{expanded ? "▾" : "▸"}</span>
    {@render question()}
  </button>
  {#if expanded}
    <div class="faq-answer" transition:slide>
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .faq-item {
    border-bottom: 2px dashed rgba(61, 41, 20, 0.3);
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .faq-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .faq-question {
    font-family: "Peaberry Base", monospace;
    font-size: 0.95rem;
    color: #3d2914;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    text-align: left;
    width: 100%;
  }

  .faq-question:hover {
    color: #f05663;
  }

  .question-icon {
    color: #f05663;
    flex-shrink: 0;
    margin-top: 0.1em;
  }

  .faq-answer {
    font-family: "Peaberry Base", monospace;
    font-size: 0.85rem;
    color: #3d2914;
    padding: 0.5rem 0 0 1.25rem;
    line-height: 1.5;
  }
</style>
