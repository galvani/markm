<script>
  import { diffWords } from 'diff';

  // previous = content at HEAD (null if the file has no committed version yet)
  // current  = the working-buffer content
  let { previous = '', current = '' } = $props();

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  let parts = $derived(diffWords(previous ?? '', current ?? ''));

  // Build the marked-up source directly as an escaped HTML string so the <pre>
  // preserves whitespace exactly (no template-injected newlines between spans).
  let html = $derived(
    parts
      .map((p) => {
        const v = esc(p.value);
        if (p.added) return `<ins>${v}</ins>`;
        if (p.removed) return `<del>${v}</del>`;
        return v;
      })
      .join('')
  );

  let unchanged = $derived(!parts.some((p) => p.added || p.removed));
</script>

<div class="diff-wrap">
  <div class="bar">
    {#if previous === null}
      New file — no committed version yet; all content shown as added.
    {:else if unchanged}
      No changes vs last commit (HEAD).
    {:else}
      Changes vs last commit (HEAD): <ins>insertions</ins> · <del>deletions</del>
    {/if}
  </div>
  <pre class="diff">{@html html}</pre>
</div>

<style>
  .diff-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .bar {
    flex: none;
    padding: 6px 16px;
    font-size: 12px;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
    background: var(--panel);
  }
  .bar ins,
  .bar del {
    font-size: 12px;
    padding: 0 4px;
  }
  .diff {
    flex: 1;
    overflow: auto;
    margin: 0;
    padding: 24px 32px;
    font-family: var(--mono);
    font-size: 14px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--fg);
  }
  .diff :global(ins) {
    background: var(--diff-ins-bg);
    text-decoration: none;
    border-radius: 3px;
  }
  .diff :global(del) {
    background: var(--diff-del-bg);
    color: var(--diff-del-fg);
    text-decoration: line-through;
    border-radius: 3px;
  }
</style>
