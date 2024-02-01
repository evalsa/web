import type { MetaFunction } from '@vercel/remix';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useEditorModel } from '~/hooks/useEditorModel';
import { Editor } from '~/components/Editor';
import { Button } from '~/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Laptop, Moon, Sun } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { useMonaco } from '~/hooks/useMonaco';
import { Link } from '@remix-run/react';
import * as cbor from 'cbor-x';

export const meta: MetaFunction = () => {
  return [
    { title: 'evalsa' },
    { name: 'description', content: 'Welcome to evalsa!' },
  ];
};

export default function Index() {
  const monaco = useMonaco();
  const [sourceModel, language, setSourceLanguage] = useEditorModel();
  const [inputModel] = useEditorModel();
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [tab, setTab] = useState<string>('src');
  const [theme, setTheme] = useState<string>();
  const [editorTheme, setEditorTheme] = useState<string>();
  const [websocket, setWebsocket] = useState<WebSocket>();

  const onRun = () => {
    if (!(sourceModel && inputModel)) return;
    setTab('result');
    const source = sourceModel.getValue();
    const stdin = inputModel.getValue();
    const encoder = new TextEncoder();
    const body = cbor.encode({
      language,
      code: encoder.encode(source),
      stdin: encoder.encode(stdin),
    });
    fetch('http://localhost:4000/run', {
      method: 'POST',
      body,
    })
      .then((r) => r.text())
      .then((id) => {
        const ws = new WebSocket(`ws://localhost:4000/notify/${id}`);

        setWebsocket(ws);
      });
  };

  useLayoutEffect(() => {
    const theme =
      window.localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    const editorTheme =
      window.localStorage.getItem('editorTheme') ||
      (theme === 'light' ? 'light' : 'vs-dark');
    setTheme(theme);
    setEditorTheme(editorTheme);
  }, []);

  useEffect(() => {
    if (websocket) {
      websocket.addEventListener('message', async (message) => {
        const buffer = new Uint8Array(await message.data.arrayBuffer());
        const data = cbor.decode(buffer);
        if (data.state.Finished) {
          const decoder = new TextDecoder();
          const output = decoder.decode(
            new Uint8Array(data.state.Finished.stdout),
          );
          const error = decoder.decode(
            new Uint8Array(data.state.Finished.stderr),
          );
          setOutput(output);
          setError(error);
        }
      });
      return () => websocket.close();
    }
  }, [websocket]);

  useEffect(() => {
    setSourceLanguage(language);
  }, [language]);

  useEffect(() => {
    theme && window.localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (monaco && editorTheme) {
      monaco.editor.setTheme(editorTheme);
      window.localStorage.setItem('editorTheme', editorTheme);
    }
  }, [monaco, editorTheme]);

  return (
    <div className="h-screen flex flex-col">
      <nav>
        <div className="container py-8 h-10 flex flex-row items-center justify-between">
          <Link to="/" className="font-bold text-lg mx-4">
            evalsa
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0">
                <Sun className="block dark:hidden" />
                <Moon className="hidden dark:block" />
                <span className="sr-only">Toggle Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="flex flex-row gap-2"
                onSelect={() => setTheme('light')}
              >
                <Sun /> Light
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-row gap-2"
                onSelect={() => setTheme('dark')}
              >
                <Moon /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex flex-row gap-2"
                onSelect={() =>
                  setTheme(
                    window.matchMedia('(prefers-color-scheme: dark)').matches
                      ? 'dark'
                      : 'light',
                  )
                }
              >
                <Laptop /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <div className="flex-1 container">
        <Tabs
          className="h-full flex flex-col"
          value={tab}
          onValueChange={setTab}
        >
          <div className="flex flex-row justify-between">
            <TabsList>
              <TabsTrigger className="p-0" value="src">
                <Select value={language} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="py-0 h-8 border-none [[data-state=inactive]_&]:pointer-events-none [[data-state=inactive]_&]:bg-muted">
                    <SelectValue placeholder="Language..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </TabsTrigger>
              <TabsTrigger value="result">Result</TabsTrigger>
            </TabsList>
            <div>
              <Button
                className="rounded-r-none"
                variant="outline"
                onClick={onRun}
              >
                Run
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="rounded-l-none" variant="outline">
                    Settings
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Editor Settings</SheetTitle>
                  </SheetHeader>
                  <div>
                    <p>Theme</p>
                    <Select value={editorTheme} onValueChange={setEditorTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="vs-dark">
                          Visual Studio Dark
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <TabsContent className="flex-1" value="src">
            {sourceModel && <Editor className="h-full" model={sourceModel} />}
          </TabsContent>
          <TabsContent className="flex-1" value="result">
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel className="flex flex-col" minSize={4}>
                <div>Input</div>
                {inputModel && <Editor className="flex-1" model={inputModel} />}
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel minSize={4}>
                <div>Output</div>
                <pre>{output}</pre>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel minSize={4}>
                <div>Error</div>
                <pre>{error}</pre>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
