export type CopyResult = 'html' | 'text' | 'failed'

export async function copyCodeBlock(plainText: string, html: string): Promise<CopyResult> {
    try {
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
            const item = new ClipboardItem({
                'text/plain': new Blob([plainText], {type: 'text/plain'}),
                'text/html': new Blob([html], {type: 'text/html'}),
            })
            await navigator.clipboard.write([item])
            return 'html'
        }
    } catch {
        // ClipboardItem construction/write can fail (permissions, unsupported
        // types) even when the API exists — fall through to the text-only path.
    }

    try {
        await navigator.clipboard.writeText(plainText)
        return 'text'
    } catch {
        return 'failed'
    }
}
