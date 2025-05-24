# Browser Evaluate Tool

## Overview

A new `browser_evaluate` tool has been added to the Playwright MCP server that allows executing JavaScript code in the browser context and returning the result.

## Features

- Execute JavaScript expressions and code snippets
- Return evaluation results in a readable format
- Handle different data types (primitives, objects, arrays)
- Proper error handling for invalid JavaScript
- JSON serialization for complex objects
- Support for both synchronous and asynchronous code

## Usage

### Tool Parameters

- `expression` (string, required): The JavaScript expression or code to execute
- `awaitPromise` (boolean, optional): Whether to await the result if it's a Promise. Defaults to true.

### Examples

#### Basic arithmetic:
```json
{
  "name": "browser_evaluate",
  "arguments": {
    "expression": "2 + 2"
  }
}
```
Returns: `Evaluation result: 4`

#### DOM manipulation:
```json
{
  "name": "browser_evaluate", 
  "arguments": {
    "expression": "document.title = 'New Title'; document.title"
  }
}
```
Returns: `Evaluation result: New Title`

#### Object creation:
```json
{
  "name": "browser_evaluate",
  "arguments": {
    "expression": "({ name: 'test', value: 42, array: [1, 2, 3] })"
  }
}
```
Returns: 
```
Evaluation result:
{
  "name": "test",
  "value": 42,
  "array": [1, 2, 3]
}
```

#### Error handling:
```json
{
  "name": "browser_evaluate",
  "arguments": {
    "expression": "nonExistentFunction()"
  }
}
```
Returns: `Error executing JavaScript: nonExistentFunction is not defined`

## Implementation Details

- Added to both snapshot and vision tool lists
- Uses Playwright's `page.evaluate()` method
- Handles serialization of complex objects using JSON.stringify
- Provides meaningful error messages for JavaScript errors
- Always returns custom content (never captures page snapshots)

## Files Modified

1. `src/tools/evaluate.ts` - New tool implementation
2. `src/tools.ts` - Added evaluate tool to both tool lists  
3. `tests/capabilities.spec.ts` - Updated tests to include new tool

The tool is now available in all MCP modes (snapshot and vision) and can be used to execute arbitrary JavaScript in the browser context. 