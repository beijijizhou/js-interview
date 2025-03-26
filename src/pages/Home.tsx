/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const JsCompiler = () => {
  const [code, setCode] = useState("console.log('hello world!');");
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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>JavaScript Playground</h1>
      
      <div ref={editorRef}>
        <CodeMirror
          value={code}
          height="300px"
          extensions={[javascript()]}
          onChange={(value) => setCode(value)}
          theme={oneDark}
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
          cursor: 'pointer'
        }}
      >
        Run Code
      </button>
      
      <div style={{
        marginTop: '20px',
        padding: '10px',
        background: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: '4px',
        minHeight: '100px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap'
      }}>
        <h3>Output:</h3>
        {output.length > 0 ? (
          output.map((line, i) => <div key={i}>{line}</div>)
        ) : (
          <div style={{ color: '#666' }}>No output yet. Run your code to see results.</div>
        )}
      </div>
    </div>
  );
};

export default JsCompiler;