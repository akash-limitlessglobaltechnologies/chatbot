import React from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";

const SandpackPreview = ({ code, type }) => {
  const getFiles = () => {
    switch (type) {
      case 'react':
        return {
          "/App.js": code,
          "/index.js": `
            import React from "react";
            import { createRoot } from "react-dom/client";
            import App from "./App";
            
            const root = createRoot(document.getElementById("root"));
            root.render(<App />);
          `,
        };
      case 'html':
        return {
          "/index.html": code,
        };
      case 'css':
        return {
          "/styles.css": code,
          "/index.html": `
            <html>
              <head>
                <link rel="stylesheet" type="text/css" href="styles.css">
              </head>
              <body>
                <h1>Sample Heading</h1>
                <p>Sample paragraph</p>
                <button>Sample Button</button>
              </body>
            </html>
          `,
        };
      case 'javascript':
        return {
          "/index.js": code,
          "/index.html": `
            <html>
              <body>
                <div id="output"></div>
                <script src="index.js"></script>
              </body>
            </html>
          `,
        };
      default:
        return {
          "/App.js": 'export default function App() { return <div>No preview available</div> }',
        };
    }
  };

  const getTemplate = () => {
    switch (type) {
      case 'react':
        return 'react';
      case 'html':
      case 'css':
      case 'javascript':
        return 'vanilla';
      default:
        return 'react';
    }
  };

  return (
    <Sandpack
      template={getTemplate()}
      files={getFiles()}
      options={{
        showNavigator: false,
        showTabs: false,
        showLineNumbers: false,
        showInlineErrors: false,
        closableTabs: false,
        readOnly: true,
      }}
    />
  );
};

const Preview = ({ currentPreview, showPreview, setShowPreview }) => {
  if (!showPreview || !currentPreview) return null;

  const { type, code, output } = currentPreview;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg overflow-hidden" style={{ width: '90vw', height: '90vh' }}>
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Visual Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-grow overflow-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Output Description:</h3>
                <p className="bg-gray-100 p-4 rounded">{output}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Visual Preview:</h3>
                <div className="border p-4 rounded preview-container">
                  <SandpackPreview code={code} type={type} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;