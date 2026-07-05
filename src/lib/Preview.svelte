<script>
  import MarkdownIt from 'markdown-it';

  let { source = '' } = $props();

  // html:false keeps raw embedded HTML inert — a viewer opening arbitrary
  // files shouldn't execute markup it was handed. linkify/typographer add the
  // niceties people expect from a modern renderer.
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

  let html = $derived(md.render(source || ''));
</script>

<div class="preview markdown-body">
  {@html html}
</div>

<style>
  .preview {
    height: 100%;
    overflow: auto;
    padding: 44px 56px;
    box-sizing: border-box;
  }
</style>
