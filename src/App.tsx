import {useEffect, useMemo, useRef, useState} from 'react'
import './App.css'
import {escapeHtml} from './lib/escapeHtml'
import {wrapCodeBlock} from './lib/wrapCodeBlock'
import {copyCodeBlock, type CopyResult} from './lib/clipboard'
import {highlightInline, SUPPORTED_LANGS, type SupportedLang} from './lib/highlight'
import {detectLanguage} from './lib/detectLanguage'
import {EXAMPLES} from './lib/examples'
import * as React from "react";
import {CodeIcon} from '@phosphor-icons/react/dist/csr/Code'
import {SunIcon} from '@phosphor-icons/react/dist/csr/Sun'
import {MoonIcon} from '@phosphor-icons/react/dist/csr/Moon'
import {CaretDownIcon} from '@phosphor-icons/react/dist/csr/CaretDown'

const INDENT = '  '

type ThemePreference = 'system' | 'light' | 'dark'

function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
    if (pref !== 'system') return pref
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function App() {
    const [code, setCode] = useState('')
    const [lang, setLang] = useState<SupportedLang>('html')
    const [autoDetect, setAutoDetect] = useState(true)
    const [status, setStatus] = useState<CopyResult | null>(null)
    const [tokensHtml, setTokensHtml] = useState('')
    const [highlightFailed, setHighlightFailed] = useState(false)
    const [themePreference, setThemePreference] = useState<ThemePreference>(
        () => (localStorage.getItem('theme-preference') as ThemePreference | null) ?? 'system',
    )
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(themePreference))
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Applies the resolved theme to the document and follows the OS setting
    // live whenever the preference is 'system'.
    useEffect(() => {
        localStorage.setItem('theme-preference', themePreference)
        const apply = () => {
            const resolved = resolveTheme(themePreference)
            document.documentElement.setAttribute('data-theme', resolved)
            setResolvedTheme(resolved)
        }
        apply()
        if (themePreference !== 'system') return
        const media = window.matchMedia('(prefers-color-scheme: light)')
        media.addEventListener('change', apply)
        return () => media.removeEventListener('change', apply)
    }, [themePreference])

    const toggleTheme = () => {
        setThemePreference(resolvedTheme === 'light' ? 'dark' : 'light')
    }

    const placeholder = EXAMPLES[lang]
    const source = code || placeholder

    useEffect(() => {
        let cancelled = false
        highlightInline(source, lang)
            .then((html) => {
                if (cancelled) return
                setTokensHtml(html)
                setHighlightFailed(false)
            })
            .catch(() => {
                if (cancelled) return
                setHighlightFailed(true)
            })
        return () => {
            cancelled = true
        }
    }, [source, lang])

    const previewHtml = useMemo(
        () => wrapCodeBlock(highlightFailed ? escapeHtml(source) : tokensHtml),
        [tokensHtml, highlightFailed, source],
    )

    const handleCopy = async () => {
        const result = await copyCodeBlock(escapeHtml(source), previewHtml)
        setStatus(result)
    }

    // Auto-dismiss the copy status a few seconds after it appears.
    useEffect(() => {
        if (!status) return
        const id = setTimeout(() => setStatus(null), 2500)
        return () => clearTimeout(id)
    }, [status])

    // Applies new source text and, unless the user has pinned a language
    // manually, re-guesses the language from its content.
    const applyCode = (next: string) => {
        setCode(next)
        if (next.trim() === '') {
            // Nothing left to go on, so let auto-detect resume on the next paste.
            setAutoDetect(true)
            return
        }
        if (!autoDetect) return
        const detected = detectLanguage(next)
        if (detected && detected !== lang) setLang(detected)
    }

    // Or dismiss it immediately once the user changes what they'd be copying.
    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStatus(null)
        applyCode(e.target.value)
    }

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(null)
        setAutoDetect(false)
        setLang(e.target.value as SupportedLang)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== 'Tab') return
        e.preventDefault()
        const el = e.currentTarget
        const {selectionStart, selectionEnd, value} = el
        const next = value.slice(0, selectionStart) + INDENT + value.slice(selectionEnd)
        const cursor = selectionStart + INDENT.length
        el.value = next
        el.setSelectionRange(cursor, cursor)
        setStatus(null)
        applyCode(next)
    }

    return (
        <div id="app">
            <header className="topbar">
                <div className="brand">
                    <CodeIcon size={16} weight="regular" />
                    <h1>Code to Text Converter</h1>
                </div>
                <div className="topbar-actions">
                    <div className="lang-select">
                        <select
                            value={lang}
                            onChange={handleLangChange}
                            aria-label="Language"
                        >
                            {SUPPORTED_LANGS.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                        <CaretDownIcon size={14} weight="regular" className="lang-select-caret" />
                    </div>
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={resolvedTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                        title={resolvedTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                    >
                        {resolvedTheme === 'light' ? (
                            <SunIcon size={16} weight="regular" />
                        ) : (
                            <MoonIcon size={16} weight="regular" />
                        )}
                    </button>
                </div>
            </header>

            <div className="workspace">
                <section className="pane source-pane">
                    <div className="pane-head">
                        <label className="pane-label" htmlFor="code-input">Source</label>
                    </div>
                    <textarea
                        id="code-input"
                        ref={textareaRef}
                        value={code}
                        onChange={handleCodeChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        spellCheck={false}
                    />
                </section>

                <section className="pane preview-pane">
                    <div className="pane-head">
                        <span className="pane-label">Preview</span>
                        <div className="pane-head-actions">
                            {status === 'html' && <span className="status ok">Copied, rich and plain text included</span>}
                            {status === 'text' && <span className="status warn">Copied as plain text (rich copy unsupported here)</span>}
                            {status === 'failed' && <span className="status error">Copy failed, select and copy manually</span>}
                            <button type="button" className="copy-btn" onClick={handleCopy}>
                                Copy
                            </button>
                        </div>
                    </div>
                    <div className="preview-frame">
                        {/* previewHtml is built from Shiki's HTML-escaped token output (or escapeHtml() as a fallback), so it can't inject live tags */}
                        <div className="preview" dangerouslySetInnerHTML={{__html: previewHtml}} />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default App
