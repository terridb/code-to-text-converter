import {createHighlighterCore, type HighlighterCore} from 'shiki/core'
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript'
import html from '@shikijs/langs/html'
import css from '@shikijs/langs/css'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
import jsx from '@shikijs/langs/jsx'
import tsx from '@shikijs/langs/tsx'
import json from '@shikijs/langs/json'
import bash from '@shikijs/langs/bash'
import python from '@shikijs/langs/python'
import java from '@shikijs/langs/java'
import markdown from '@shikijs/langs/markdown'
import docker from '@shikijs/langs/docker'
import xml from '@shikijs/langs/xml'
import properties from '@shikijs/langs/properties'
import kotlin from '@shikijs/langs/kotlin'
import yaml from '@shikijs/langs/yaml'
import sql from '@shikijs/langs/sql'
import monokai from '@shikijs/themes/monokai'

export const SUPPORTED_LANGS = [
    'html',
    'css',
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'html+js',
    'json',
    'bash',
    'python',
    'java',
    'markdown',
    'docker',
    'xml',
    'properties',
    'kotlin',
    'yaml',
    'sql',
] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

const THEME = 'monokai'

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighterCore({
            themes: [monokai],
            langs: [html, css, javascript, typescript, jsx, tsx, json, bash, python, java, markdown, docker, xml, properties, kotlin, yaml, sql],
            engine: createJavaScriptRegexEngine(),
        })
    }
    return highlighterPromise
}

// Returns HTML-escaped, color-highlighted <span> tokens only, no <pre>/<code>
// wrapper and no background/foreground colors of its own, so it can be
// dropped straight into wrapCodeBlock()'s <pre>.
export async function highlightInline(code: string, lang: SupportedLang): Promise<string> {
    if (lang === 'html+js') return highlightMixedHtmlJs(code)
    const highlighter = await getHighlighter()
    return highlighter.codeToHtml(code, {
        lang,
        theme: THEME,
        structure: 'inline',
    })
}

// 'html+js' isn't a real grammar — no single TextMate grammar can highlight a
// bare HTML tag sitting next to an unrelated, un-wrapped JS statement (that's
// not valid JSX, and HTML's grammar only tokenizes JS inside <script>). So
// instead of picking one grammar for the whole paste, split it line-by-line
// into contiguous HTML-looking and JS-looking runs, highlight each run with
// its own grammar, and stitch the results back together.
async function highlightMixedHtmlJs(code: string): Promise<string> {
    const highlighter = await getHighlighter()
    const lines = code.split('\n')

    type Chunk = {lang: 'html' | 'javascript'; lines: string[]}
    const chunks: Chunk[] = []
    for (const line of lines) {
        const chunkLang: Chunk['lang'] = /^\s*<\/?[a-zA-Z]/.test(line) ? 'html' : 'javascript'
        const last = chunks[chunks.length - 1]
        if (last && last.lang === chunkLang) last.lines.push(line)
        else chunks.push({lang: chunkLang, lines: [line]})
    }

    const chunkHtml = chunks.map((chunk) =>
        highlighter.codeToHtml(chunk.lines.join('\n'), {
            lang: chunk.lang,
            theme: THEME,
            structure: 'inline',
        }),
    )
    // Each chunk's own line breaks are already <br>-joined internally; one more
    // <br> between chunks reproduces the line break at the chunk boundary.
    return chunkHtml.join('<br>')
}
