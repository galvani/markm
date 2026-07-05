<script>
  // A full-pane picker shown when markm is launched on a directory (e.g.
  // `markm .` or `markm /tmp`). Lists the markdown files in that folder,
  // filters live as you type, and sorts by modified-time (default) or name.

  let { dir = '', files = [], onPick, onClose } = $props();

  let filter = $state('');
  let sort = $state('modified'); // 'modified' | 'name'

  let shown = $derived(
    files
      .filter((f) => f.name.toLowerCase().includes(filter.trim().toLowerCase()))
      .slice()
      .sort((a, b) =>
        sort === 'name' ? a.name.localeCompare(b.name) : b.modifiedAt - a.modifiedAt,
      ),
  );

  function fmtDate(ms) {
    if (!ms) return '';
    try {
      return new Date(ms).toLocaleString();
    } catch {
      return '';
    }
  }

  function onFilterKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (shown.length) onPick?.(shown[0].path); // Enter opens the top match
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  }

  // Autofocus the filter so you can start typing immediately on launch.
  function autofocus(node) {
    node.focus();
  }
</script>

<div class="chooser">
  <div class="head">
    <div class="titles">
      <div class="title">Open a markdown file</div>
      <div class="dir" title={dir}>{dir}</div>
    </div>
    <div class="controls">
      <input
        class="filter"
        placeholder="Filter…"
        bind:value={filter}
        onkeydown={onFilterKey}
        use:autofocus
      />
      <div class="sort" role="group" aria-label="Sort by">
        <button class:active={sort === 'modified'} onclick={() => (sort = 'modified')}>Modified</button>
        <button class:active={sort === 'name'} onclick={() => (sort = 'name')}>Name</button>
      </div>
    </div>
  </div>

  <ul class="list">
    {#each shown as f (f.path)}
      <li>
        <button class="row" onclick={() => onPick?.(f.path)}>
          <span class="name">{f.name}</span>
          <span class="meta">{fmtDate(f.modifiedAt)}</span>
        </button>
      </li>
    {:else}
      <li class="empty">
        {files.length ? 'No files match the filter.' : 'No markdown files in this folder.'}
      </li>
    {/each}
  </ul>
</div>

<style>
  .chooser {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg);
    color: var(--fg);
  }
  .head {
    flex: none;
    padding: 20px 24px 14px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .title {
    font-size: 15px;
    font-weight: 600;
    color: var(--heading);
  }
  .dir {
    font-size: 12px;
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--mono);
  }
  .controls {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .filter {
    flex: 1;
    height: 30px;
    padding: 0 12px;
    font: inherit;
    font-size: 13px;
    background: var(--panel);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 6px;
  }
  .filter:focus {
    outline: none;
    border-color: var(--accent);
  }
  .sort {
    display: flex;
    height: 30px;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }
  .sort button {
    font: inherit;
    font-size: 12px;
    padding: 0 12px;
    background: var(--bg);
    color: var(--fg);
    border: none;
    border-right: 1px solid var(--border);
    cursor: pointer;
  }
  .sort button:last-child {
    border-right: none;
  }
  .sort button.active {
    background: var(--accent);
    color: var(--accent-fg);
  }

  .list {
    flex: 1;
    overflow: auto;
    margin: 0;
    padding: 8px;
    list-style: none;
  }
  .row {
    width: 100%;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    padding: 9px 14px;
    font: inherit;
    text-align: left;
    background: none;
    color: var(--fg);
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .row:hover {
    background: var(--panel);
  }
  .row .name {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row .meta {
    flex: none;
    font-size: 11px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .empty {
    padding: 24px 14px;
    color: var(--muted);
    font-size: 13px;
    text-align: center;
  }
</style>
