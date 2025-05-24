/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from 'zod';
import { defineTool, type ToolFactory } from './tool.js';

const evaluate: ToolFactory = captureSnapshot => defineTool({
  capability: 'core',
  schema: {
    name: 'browser_evaluate',
    title: 'Evaluate JavaScript',
    description: 'Execute JavaScript code in the browser context and return the result',
    inputSchema: z.object({
      expression: z.string().describe('The JavaScript expression or code to execute'),
      awaitPromise: z.boolean().optional().describe('Whether to await the result if it\'s a Promise. Defaults to true'),
    }),
    type: 'destructive',
  },

  handle: async (context, params) => {
    const tab = context.currentTabOrDie();

    const code = [
      `// Evaluate JavaScript expression: ${params.expression.slice(0, 100)}${params.expression.length > 100 ? '...' : ''}`,
      `const result = await page.evaluate(${JSON.stringify(params.expression)});`
    ];

    const action = async () => {
      try {
        let result;
        if (params.awaitPromise !== false) {
          // By default, await promises
          result = await tab.page.evaluate(params.expression);
        } else {
          // Don't await promises if explicitly set to false
          result = await tab.page.evaluateHandle(params.expression);
          result = await result.jsonValue().catch(() => '[Object or Function]');
        }

        // Handle different types of results
        let resultText: string;
        if (result === undefined) {
          resultText = 'undefined';
        } else if (result === null) {
          resultText = 'null';
        } else if (typeof result === 'object') {
          try {
            resultText = JSON.stringify(result, null, 2);
          } catch (e) {
            resultText = '[Circular reference or non-serializable object]';
          }
        } else {
          resultText = String(result);
        }

        return {
          content: [{ 
            type: 'text' as const, 
            text: `Evaluation result:\n${resultText}` 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text' as const, 
            text: `Error executing JavaScript:\n${error instanceof Error ? error.message : String(error)}` 
          }]
        };
      }
    };

    return {
      code,
      action,
      captureSnapshot: false,
      waitForNetwork: false
    };
  },
});

export default (captureSnapshot: boolean) => [
  evaluate(captureSnapshot)
]; 