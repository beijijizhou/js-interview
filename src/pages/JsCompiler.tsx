/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useQuery } from '@tanstack/react-query';

const JsCompiler = () => {
  const { data: generatedCode } = useQuery<string>({
    queryKey: ['generatedCode'],
    queryFn: () => '',
    initialData: "console.log('hello world!');"
  });

  const [code, setCode] = useState(generatedCode);
  const [output, setOutput] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const runCode = () => {
    try {
      // Clear previous output
      setOutput([]);
      
      // Capture console.log output
      const originalConsoleLog = console.log;
      const logs: string[] = [];
      
      console.log = (...args: any[]) => {
        logs.push(args.join(' '));
        originalConsoleLog(...args);
      };

      // Execute the code
      new Function(code)();

      // Restore console and update output
      console.log = originalConsoleLog;
      setOutput(logs);
      
    } catch (error) {
      setOutput([`Error: ${error instanceof Error ? error.message : String(error)}`]);
    }
  };
  useEffect(() => {
    setCode(generatedCode);
  }, [generatedCode]);
  return (
    <div style={{ 
      padding: '20px', 
      margin: '0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '20px' }}>JavaScript Playground</h1>
      
      <div ref={editorRef} style={{ width: '100%' }}>
        <CodeMirror
          value={code}
          height="300px"
          extensions={[javascript()]}
          onChange={(value) => setCode(value)}
          theme={oneDark}
          style={{ 
            textAlign: 'left',
            fontSize: '14px',
            border: '1px solid #333',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <button
        onClick={runCode}
        style={{
          margin: '10px 0',
          padding: '8px 16px',
          background: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Run Code
      </button>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: '4px',
        minHeight: '100px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        textAlign: 'left',
        border: '1px solid #333'
      }}>
        <h3 style={{ 
          marginTop: '0',
          marginBottom: '10px',
          color: '#f0f0f0'
        }}>
          Output:
        </h3>
        {output.length > 0 ? (
          output.map((line, i) => (
            <div key={i} style={{ 
              marginBottom: '4px',
              wordBreak: 'break-word'
            }}>
              {line}
            </div>
          ))
        ) : (
          <div style={{ color: '#666' }}>No output yet. Run your code to see results.</div>
        )}
      </div>
    </div>
  );
};

export default JsCompiler;