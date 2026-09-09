import type {SupportedLang} from './highlight'

export const EXAMPLES: Record<SupportedLang, string> = {
    html: '<div>Hello!</div>',
    css: '.button {\n  color: red;\n}',
    javascript: 'function greet() {\n  return "hello";\n}',
    typescript: 'function greet(name: string): string {\n  return `hello ${name}`;\n}',
    json: '{\n  "hello": "world"\n}',
    bash: 'echo "hello world"',
    python: 'def greet():\n    return "hello"',
    java: 'class Hello {\n  void greet() {}\n}',
    markdown: '# Hello\n\nSome **bold** text.',
    docker: 'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["npm", "start"]',
    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<greeting>\n  <text>Hello!</text>\n</greeting>',
    properties: 'server.port=8080\nspring.application.name=demo',
    kotlin: 'fun greet(): String {\n    return "hello"\n}',
    yaml: 'greeting:\n  text: hello\n  loud: true',
    sql: 'SELECT id, name\nFROM users\nWHERE active = true;',
}
