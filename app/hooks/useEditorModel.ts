import { useEffect, useState } from 'react';
import type Monaco from 'monaco-editor';
import { useMonaco } from './useMonaco';

export function useEditorModel() {
  const monaco = useMonaco();
  const [model, setModel] = useState<Monaco.editor.ITextModel>();
  useEffect(() => {
    if (monaco) {
      const model = monaco.editor.createModel('');
      setModel(model);
      return () => model.dispose();
    }
  }, [monaco]);

  const setLanguage = (language: string) => {
    if (monaco && model) {
      monaco.editor.setModelLanguage(model, language);
    }
  };
  return [model, setLanguage] as const;
}
