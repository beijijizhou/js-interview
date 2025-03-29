/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useQuery } from '@tanstack/react-query';
import { initialCode } from './util';

const JsCompiler = () => {
  const { data: generatedCode } = useQuery<string>({
    queryKey: ['generatedCode'],
    queryFn: () => '',
    initialData: initialCode,
  });

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const runCode = async () => {
    // Clear previous output
    setOutput([]);
    
    // Store original console methods
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    // Override console methods to capture output
    console.log = (...args) => {
      setOutput(prev => [
        ...prev,
        args.map(arg => String(arg)).join(' ')
      ]);
    };
    
    console.error = (...args) => {
      setOutput(prev => [
        ...prev,
        `Error: ${args.map(arg => String(arg)).join(' ')}`
      ]);
    };
  
    try {
      // Create the function and execute it, awaiting any promises
      const fn = new Function(`
        return new Promise((resolve, reject) => {
          const result = (() => { ${code} })();
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        });
      `);
      
      await fn();
    } catch (error) {
      setOutput(prev => [
        ...prev,
        `Error: ${error instanceof Error ? error.message : String(error)}`
      ]);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setOutput(prev => [...prev, "Execution completed"]);
    }
  };
  useEffect(()=>{
    if(generatedCode){
      setCode(generatedCode)
    }
  },[generatedCode])
  return (
    <div className="p-5 font-sans">
      <h1 className="mb-5 text-2xl font-bold">JavaScript Playground</h1>
      
      <div ref={editorRef} className="w-full">
        <CodeMirror
          value={code}
          height="300px"
          extensions={[javascript()]}
          onChange={(value) => setCode(value)}
          theme={oneDark}
          className="text-left text-sm border border-gray-600 rounded"
        />
      </div>
      
      <button
        onClick={runCode}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Run Code
      </button>
      
      <div className="mt-5 p-4 bg-gray-900 text-gray-300 rounded border border-gray-600 min-h-[100px] font-mono whitespace-pre-wrap text-left">
        <h3 className="mt-0 mb-2 text-lg text-gray-100">Output:</h3>
        {output.length > 0 ? (
          output.map((line, i) => (
            <div key={i} className="mb-1 break-words">{line}</div>
          ))
        ) : (
          <div className="text-gray-500">No output yet. Run your code to see results.</div>
        )}
      </div>
    </div>
  );
};

export default JsCompiler;