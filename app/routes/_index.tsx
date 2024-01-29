import type { MetaFunction } from '@remix-run/node';
import { useState } from 'react';
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
import { requestRun } from '~/api/requestRun';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable';

export const meta: MetaFunction = () => {
  return [
    { title: 'evalsa' },
    { name: 'description', content: 'Welcome to evalsa!' },
  ];
};

export default function Index() {
  const [sourceModel, setSourceLanguage] = useEditorModel();
  const [inputModel] = useEditorModel();
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [tab, setTab] = useState<string>('src');

  const onRun = () => {
    if (!(sourceModel && inputModel)) return;
    setTab('result');
    const source = sourceModel.getValue();
    const stdin = inputModel.getValue();
    requestRun(source, stdin).then(({ stdout, stderr }) => {
      setOutput(stdout);
      setError(stderr);
    });
  };

  return (
    <>
      <nav>
        <div className="container px-8 flex flex-row justify-between">
          <h1 className="font-bold text-lg">evalsa</h1>
          
        </div>
      </nav>
      <div className="container h-screen">
        <Tabs
          className="h-full flex flex-col"
          value={tab}
          onValueChange={setTab}
        >
          <div className="flex flex-row justify-between">
            <TabsList>
              <TabsTrigger className="p-0" value="src">
                <Select onValueChange={setSourceLanguage}>
                  <SelectTrigger className="py-0 h-8 border-none [[data-state=inactive]_&]:pointer-events-none">
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
            <Button variant="outline" onClick={onRun}>
              Run
            </Button>
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
    </>
  );
}
