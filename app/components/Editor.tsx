import type Monaco from 'monaco-editor';
import { useEffect, useState } from 'react';
import { useMonaco } from '~/hooks/useMonaco';

export interface EditorProps {
  className?: string;
  model: Monaco.editor.ITextModel;
  options?: Omit<
    Monaco.editor.IStandaloneEditorConstructionOptions,
    'model' | 'theme'
  >;
}

export function Editor({ className, model, options }: EditorProps) {
  const monaco = useMonaco();
  const [editorDiv, setEditorDiv] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (monaco && editorDiv) {
      const editor = monaco.editor.create(editorDiv, {
        ...options,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        model,
      });
      return () => {
        editor.dispose();
      };
    }
  }, [monaco, model, editorDiv]);

  return <div className={className} ref={(div) => setEditorDiv(div)} />;
}
