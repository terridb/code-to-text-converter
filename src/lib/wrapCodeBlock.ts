export function wrapCodeBlock(innerHtml: string): string {
    return `<div style="color:#75715e;background:#1c1c1f;border-radius:4px;white-space:pre-wrap;padding:32px;max-width:100%;box-sizing:border-box;" title="codeblok">
<pre spellcheck="false" style="white-space:pre-wrap;overflow-wrap:break-word;word-break:break-word;min-width:0;margin:0;tab-size:2;">${innerHtml}</pre>
</div>`
}
