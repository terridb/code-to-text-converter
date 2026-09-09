import {createHighlighterCore, type HighlighterCore} from 'shiki/core'
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript'
import html from '@shikijs/langs/html'
import css from '@shikijs/langs/css'
import javascript from '@shikijs/langs/javascript'
import typescript from '@shikijs/langs/typescript'
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
            langs: [html, css, javascript, typescript, json, bash, python, java, markdown, docker, xml, properties, kotlin, yaml, sql],
            engine: createJavaScriptRegexEngine(),
        })
    }
    return highlighterPromise
}

// Returns HTML-escaped, color-highlighted <span> tokens only, no <pre>/<code>
// wrapper and no background/foreground colors of its own, so it can be
// dropped straight into wrapCodeBlock()'s <pre>.
export async function highlightInline(code: string, lang: SupportedLang): Promise<string> {
    const highlighter = await getHighlighter()
    return highlighter.codeToHtml(code, {
        lang,
        theme: THEME,
        structure: 'inline',
    })
}
