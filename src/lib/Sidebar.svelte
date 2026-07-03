<script>
  let { folderName = '', files = [], activePath = null, onSelect } = $props();
</script>

<aside class="sidebar">
  <div class="head" title={folderName}>{folderName || 'No folder'}</div>
  <div class="list">
    {#if files.length === 0}
      <div class="empty">No markdown files</div>
    {:else}
      {#each files as f (f.path)}
        <button
          class="item"
          class:active={f.path === activePath}
          title={f.name}
          onclick={() => onSelect?.(f.path)}
        >{f.name}</button>
      {/each}
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 220px;
    flex: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--panel);
    border-right: 1px solid var(--border);
    overflow: hidden;
  }
  .head {
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
  .list {
    flex: 1;
    overflow: auto;
    padding: 4px;
  }
  .item {
    display: block;
    width: 100%;
    text-align: left;
    font-size: 13px;
    padding: 5px 8px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--fg);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item:hover { background: var(--sel); }
  .item.active {
    background: var(--accent);
    color: var(--accent-fg);
  }
  .empty {
    padding: 10px 12px;
    font-size: 12px;
    color: var(--muted);
  }
</style>
