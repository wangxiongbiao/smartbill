#!/usr/bin/env python3

import json
import re
import subprocess
import sys
import time
from pathlib import Path

from deep_translator import GoogleTranslator


ROOT = Path('/Users/admin/project/smartbill')
I18N_TS = ROOT / 'i18n.ts'
LOCALES_DIR = ROOT / 'locales'

PLACEHOLDER_RE = re.compile(r'\{[^{}]+\}')

TARGETS = {
    'zh-CN': {
        'source_lang': 'zh-TW',
        'target_lang': 'zh-CN',
    },
    'th': {
        'source_lang': 'en',
        'target_lang': 'th',
    },
    'id': {
        'source_lang': 'en',
        'target_lang': 'id',
    },
}


def load_base_translations():
    node_script = r"""
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(process.argv[1], 'utf8');
const match = source.match(/const baseTranslations = (\{[\s\S]*\});\s*export const translations/);
if (!match) {
  throw new Error('Failed to locate baseTranslations in i18n.ts');
}
const sandbox = {};
vm.createContext(sandbox);
const script = new vm.Script('result = ' + match[1]);
script.runInContext(sandbox);
process.stdout.write(JSON.stringify(sandbox.result));
"""
    result = subprocess.run(
        ['node', '-e', node_script, str(I18N_TS)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def mask_placeholders(text: str):
    placeholders = []

    def replace(match):
        token = f'__PLACEHOLDER_{len(placeholders)}__'
        placeholders.append((token, match.group(0)))
        return token

    masked = PLACEHOLDER_RE.sub(replace, text).replace('\n', '__NEWLINE__')
    return masked, placeholders


def unmask_placeholders(text: str, placeholders):
    restored = text
    for token, value in placeholders:
        restored = restored.replace(token, value)
    return restored.replace('__NEWLINE__', '\n')


def should_skip_translation(value: str):
    stripped = value.strip()
    if not stripped:
      return True
    if stripped.startswith('http://') or stripped.startswith('https://'):
      return True
    if '@' in stripped and ' ' not in stripped:
      return True
    return False


def translate_text(translator, text: str):
    if should_skip_translation(text):
        return text

    masked, placeholders = mask_placeholders(text)

    for attempt in range(3):
        try:
            translated = translator.translate(masked)
            return unmask_placeholders(translated, placeholders)
        except Exception:
            if attempt == 2:
                raise
            time.sleep(1.0 + attempt)


def collect_strings(value, path='', results=None):
    if results is None:
        results = []

    if isinstance(value, dict):
        for key, child in value.items():
            if key == 'name' and path.endswith('testimonialsList'):
                continue
            next_path = f'{path}.{key}' if path else key
            collect_strings(child, next_path, results)
        return results

    if isinstance(value, list):
        for child in value:
            collect_strings(child, path, results)
        return results

    if isinstance(value, str) and not should_skip_translation(value):
        masked, placeholders = mask_placeholders(value)
        results.append((value, masked, placeholders))

    return results


def translate_batch(translator, strings):
    unique_masked = []
    seen = set()
    placeholder_map = {}

    for original, masked, placeholders in strings:
        placeholder_map[masked] = placeholders
        if masked not in seen:
            seen.add(masked)
            unique_masked.append(masked)

    translated_map = {}
    batch_size = 30
    for index in range(0, len(unique_masked), batch_size):
        batch = unique_masked[index:index + batch_size]
        for attempt in range(3):
            try:
                translated_batch = translator.translate_batch(batch)
                for source_text, translated_text in zip(batch, translated_batch):
                    translated_map[source_text] = unmask_placeholders(
                        translated_text,
                        placeholder_map[source_text],
                    )
                print(f'Translated {index + len(batch)}/{len(unique_masked)}')
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(1.0 + attempt)

    return translated_map


def translate_value(value, translated_map, path=''):
    if isinstance(value, dict):
        result = {}
        for key, child in value.items():
            if key == 'name' and path.endswith('testimonialsList'):
                result[key] = child
            else:
                next_path = f'{path}.{key}' if path else key
                result[key] = translate_value(child, translated_map, next_path)
        return result

    if isinstance(value, list):
        return [translate_value(child, translated_map, path) for child in value]

    if isinstance(value, str):
        if should_skip_translation(value):
            return value
        masked, _ = mask_placeholders(value)
        return translated_map[masked]

    return value


def main():
    LOCALES_DIR.mkdir(parents=True, exist_ok=True)
    base = load_base_translations()

    for language, config in TARGETS.items():
        source_payload = base[config['source_lang']]
        translator = GoogleTranslator(source='auto', target=config['target_lang'])
        strings = collect_strings(source_payload)
        translated_map = translate_batch(translator, strings)
        translated = translate_value(source_payload, translated_map)
        output_path = LOCALES_DIR / f'i18n.{language}.json'
        output_path.write_text(
            json.dumps(translated, ensure_ascii=False, indent=2) + '\n',
            encoding='utf-8',
        )
        print(f'Wrote {output_path}')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'Failed: {exc}', file=sys.stderr)
        sys.exit(1)
