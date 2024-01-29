import { useEffect, useState } from 'react';
import type Monaco from 'monaco-editor';

export function useMonaco() {
  const [monaco, setMonaco] = useState<typeof Monaco>();
  useEffect(() => {
    import('monaco-editor').then(setMonaco);
  }, []);
  return monaco;
}
