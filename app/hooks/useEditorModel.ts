import { useEffect, useState } from 'react';
import type Monaco from 'monaco-editor';
import { useMonaco } from './useMonaco';

export function useEditorModel() {
  const monaco = useMonaco();
  const [model, setModel] = useState<Monaco.editor.ITextModel>();
  const [language, setLanguage] = useState<string>('');
  useEffect(() => {
    if (monaco) {
      const model = monaco.editor.createModel('');
      setModel(model);
      return () => model.dispose();
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco && model && language) {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [monaco, model, language]);

  return [model, language, setLanguage] as const;
}
