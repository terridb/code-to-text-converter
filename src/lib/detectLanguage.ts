import {SUPPORTED_LANGS, type SupportedLang} from './highlight'

type Rule = {
    pattern: RegExp
    weight: number
}

const MIN_SCORE = 3

const RULES: Partial<Record<SupportedLang, Rule[]>> = {
    html: [
        {pattern: /<!doctype html>/i, weight: 6},
        {pattern: /<\/[a-z][\w-]*>/i, weight: 3},
        {pattern: /<[a-z][\w-]*(\s[^<>]*)?\/?>/i, weight: 2},
        {
            pattern: /<(html|head|body|div|span|section|article|nav|header|footer|main|aside|button|input|script|style|link|meta|title|form|label|select|option|textarea|table|thead|tbody|tr|td|th|ul|ol|li|img|a|h[1-6]|p)\b/i,
            weight: 3,
        },
    ],
    xml: [
        {pattern: /<\?xml\s+version=/i, weight: 6},
        {pattern: /xmlns(:\w+)?=["']/, weight: 4},
        {pattern: /<(project|beans|dependency|dependencies|configuration)\b/i, weight: 4},
        {pattern: /<\/(\w+:)?[\w.-]+>\s*$/, weight: 1},
    ],
    docker: [
        // Dockerfiles always open with FROM, so only the first line counts —
        // a bare "FROM <table>" clause in SQL would otherwise match too.
        {pattern: /^FROM\s+\S+(\s+AS\s+\S+)?[ \t]*(\r?\n|$)/i, weight: 6},
        {pattern: /^\s*(RUN|COPY|ADD|CMD|ENTRYPOINT|WORKDIR|EXPOSE|ENV|ARG|LABEL|USER|VOLUME|HEALTHCHECK)\s+\S/m, weight: 3},
    ],
    properties: [
        {pattern: /^\s*\[[\w.-]+]\s*$/m, weight: 4},
        {pattern: /^\s*[a-zA-Z][\w.-]*\s*=\s*\S*\s*$/m, weight: 2},
        {pattern: /^\s*[a-zA-Z][\w.-]*\.[\w.-]*\s*=/m, weight: 2},
    ],
    yaml: [
        {pattern: /^---\s*$/m, weight: 4},
        // Excludes lines ending in ';' or ',' so CSS declarations
        // ("border: 1px solid;") and JS/JSON object properties
        // ("name: 'Davy Klaassen',") don't get mistaken for YAML "key: value" pairs.
        {pattern: /^\s*[\w.-]+:(?:\s*$|\s+[^;,\n]*$)/m, weight: 2},
        {pattern: /^\s*-\s+[\w.-]+:\s/m, weight: 2},
        {pattern: /^\s{2,}[\w.-]+:(?:\s*$|\s+[^;,\n]*$)/m, weight: 2},
    ],
    sql: [
        {pattern: /\bSELECT\b[\s\S]*\bFROM\b/i, weight: 4},
        {pattern: /\bCREATE\s+TABLE\b/i, weight: 4},
        {pattern: /\bINSERT\s+INTO\b/i, weight: 4},
        {pattern: /\bUPDATE\b[\s\S]*\bSET\b/i, weight: 4},
        {pattern: /\bDELETE\s+FROM\b/i, weight: 4},
        {pattern: /\bWHERE\b|\bJOIN\b|\bGROUP\s+BY\b|\bORDER\s+BY\b/i, weight: 1},
    ],
    kotlin: [
        {pattern: /\bfun\s+\w+\s*\(/, weight: 4},
        {pattern: /\bdata\s+class\s+\w+/, weight: 4},
        {pattern: /\bcompanion\s+object\b/, weight: 3},
        {pattern: /\b(val|var)\s+\w+\s*[:=]/, weight: 2},
        {pattern: /\bprintln\(/, weight: 1},
        {pattern: /\boverride\s+fun\b/, weight: 3},
    ],
    markdown: [
        {pattern: /^#{1,6}\s+\S/m, weight: 3},
        {pattern: /^```/m, weight: 4},
        {pattern: /\[[^\]]+]\([^)]+\)/, weight: 2},
        {pattern: /^\s*[-*+]\s+\S/m, weight: 1},
        {pattern: /\*\*[^*]+\*\*/, weight: 1},
    ],
    css: [
        {pattern: /[.#]?[\w-]+\s*\{[^{}]*:[^{}]*;[^{}]*}/, weight: 4},
        {pattern: /@(media|import|keyframes|font-face)\b/, weight: 3},
        {pattern: /^\s*[.#][\w-]+[^{}]*\{/m, weight: 2},
    ],
    bash: [
        {pattern: /^#!.*\b(bash|sh|zsh)\b/m, weight: 6},
        {pattern: /^\s*(if|then|fi|for|do|done|elif)\b/m, weight: 2},
        {pattern: /\|\s*grep\b/, weight: 2},
        {pattern: /\bsudo\b|\bapt-get\b|\bnpm run\b/, weight: 1},
        {pattern: /\$\{?\w+\}?/, weight: 1},
        {pattern: /^\s*echo\b/m, weight: 3},
        // Plain CLI invocations ("nodemon app.js", "git status", "npm install")
        // carry none of the shell-scripting signals above, so recognize common
        // command-line tool names at the start of a line too.
        // Ordinary English words ("cat", "go", "make", "cargo"...) are deliberately
        // excluded even though they're also CLI tool names, since a prose line
        // starting with one would otherwise be misdetected as bash.
        {
            pattern: /^\s*(npm|npx|yarn|pnpm|node|nodemon|python3?|pip3?|git|docker|docker-compose|kubectl|ssh|scp|curl|wget|chmod|chown|mkdir|rmdir|cp|mv|ls|cd|touch|tar|mvn|gradle|systemctl|brew|apt-get|apt|yum|dnf|choco|winget)\b/m,
            weight: 3,
        },
    ],
    python: [
        {pattern: /^\s*def\s+\w+\s*\(.*\)\s*:/m, weight: 4},
        {pattern: /^\s*class\s+\w+.*:\s*$/m, weight: 3},
        {pattern: /^\s*(import|from)\s+\w+/m, weight: 2},
        {pattern: /\belif\b/, weight: 2},
        {pattern: /\bself\b/, weight: 1},
        {pattern: /\bprint\(/, weight: 1},
    ],
    java: [
        {pattern: /\bpublic\s+(static\s+)?(class|void|final)\b/, weight: 4},
        {pattern: /\bSystem\.out\.println\(/, weight: 4},
        {pattern: /\bimport\s+java\./, weight: 3},
        {pattern: /\bprivate\s+\w+/, weight: 1},
        {pattern: /\bnew\s+\w+\(/, weight: 1},
        {pattern: /;\s*$/m, weight: 1},
        {pattern: /\bvoid\s+\w+\s*\(/, weight: 3},
    ],
    typescript: [
        {pattern: /\binterface\s+\w+/, weight: 4},
        {pattern: /\btype\s+\w+\s*=/, weight: 3},
        {pattern: /\bimplements\s+\w+/, weight: 3},
        {pattern: /\benum\s+\w+/, weight: 3},
        {pattern: /:\s*(string|number|boolean|any|void|unknown|never)\b/, weight: 3},
        {pattern: /\bas\s+\w+\b/, weight: 1},
        {pattern: /<\w+>\(/, weight: 1},
    ],
    javascript: [
        {pattern: /\b(const|let|var)\s+\w+\s*=/, weight: 3},
        {pattern: /=>\s*[{(]?/, weight: 3},
        {pattern: /\bfunction\s+\w+\s*\(/, weight: 3},
        {pattern: /\bfunction\s*\(/, weight: 3},
        {pattern: /\bconsole\.log\(/, weight: 3},
        {pattern: /\brequire\(['"]/, weight: 3},
        {pattern: /\bmodule\.exports\b/, weight: 3},
        {pattern: /\bdocument\.|\bwindow\./, weight: 1},
    ],
}

function isLikelyJson(trimmed: string): boolean {
    if (!/^[[{]/.test(trimmed) || !/[\]}]$/.test(trimmed)) return false
    try {
        JSON.parse(trimmed)
        return true
    } catch {
        return false
    }
}

// Guesses the language of `code` from a handful of syntax fingerprints.
// Returns null when the input is too short or too ambiguous to call.
export function detectLanguage(code: string): SupportedLang | null {
    const trimmed = code.trim()
    if (trimmed.length < 3) return null

    if (isLikelyJson(trimmed)) return 'json'

    const scores = SUPPORTED_LANGS
        .filter((lang): lang is Exclude<SupportedLang, 'json'> => lang !== 'json')
        .map((lang) => {
            const score = (RULES[lang] ?? []).reduce(
                (total, {pattern, weight}) => (pattern.test(trimmed) ? total + weight : total),
                0,
            )
            return [lang, score] as const
        })

    const maxScore = Math.max(...scores.map(([, score]) => score))
    if (maxScore < MIN_SCORE) return null

    const topLangs = scores.filter(([, score]) => score === maxScore).map(([lang]) => lang)
    if (topLangs.length === 1) return topLangs[0]

    // TypeScript syntax is a superset of JavaScript's, so a tied score between
    // the two just means the TS-only signals didn't fire — prefer TS anyway.
    if (topLangs.length === 2 && topLangs.includes('javascript') && topLangs.includes('typescript')) {
        return 'typescript'
    }

    return null
}
