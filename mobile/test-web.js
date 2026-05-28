const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

console.log('Launching headless Chrome to test http://localhost:8082...');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  '--user-data-dir=' + require('os').tmpdir() + '/chrome-test-profile-' + Date.now(),
  'http://localhost:8082'
]);

let hasErrors = false;
let logCount = 0;

chrome.on('error', (err) => {
  console.error('Failed to start Chrome:', err);
  process.exit(1);
});

// Wait for Chrome to start the debugging server
setTimeout(() => {
  http.get('http://localhost:9222/json/list', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const list = JSON.parse(data);
        const page = list.find(item => item.type === 'page');
        if (!page || !page.webSocketDebuggerUrl) {
          console.error('No active page found in Chrome remote debugging. Response:', data);
          chrome.kill();
          process.exit(1);
        }

        console.log('Connecting to Chrome DevTools Protocol at:', page.webSocketDebuggerUrl);
        const ws = new WebSocket(page.webSocketDebuggerUrl);

        ws.on('open', () => {
          console.log('CDP Connection opened. Enabling Runtime...');
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        });

        ws.on('message', (message) => {
          try {
            const msg = JSON.parse(message.toString());
            
            if (msg.method === 'Runtime.consoleAPICalled') {
              logCount++;
              const type = msg.params.type;
              const args = msg.params.args.map(arg => {
                if (arg.value !== undefined) return arg.value;
                if (arg.description !== undefined) return arg.description;
                return JSON.stringify(arg);
              });
              console.log(`\x1b[36m[BROWSER CONSOLE ${type.toUpperCase()}]\x1b[0m`, ...args);
              
              // Count error logs
              if (type === 'error' || type === 'warning' && args.some(arg => String(arg).includes('Error'))) {
                hasErrors = true;
              }
            }

            if (msg.method === 'Runtime.exceptionThrown') {
              hasErrors = true;
              console.error('\x1b[31m[BROWSER UNHANDLED EXCEPTION]:\x1b[0m', msg.params.exceptionDetails.exception.description || msg.params.exceptionDetails.text);
            }
          } catch (e) {
            console.error('Error parsing CDP message:', e);
          }
        });

        ws.on('error', (err) => {
          console.error('WebSocket connection error:', err);
        });

        // Let the page load and capture logs for 8 seconds
        setTimeout(() => {
          console.log('\n--- Test Execution Finished ---');
          console.log(`Total console logs captured: ${logCount}`);
          if (hasErrors) {
            console.log('\x1b[31m[FAILURE] Console errors or unhandled exceptions detected on the page!\x1b[0m');
          } else {
            console.log('\x1b[32m[SUCCESS] No console errors or unhandled exceptions were detected!\x1b[0m');
          }
          ws.close();
          chrome.kill();
          process.exit(hasErrors ? 1 : 0);
        }, 12000);

      } catch (err) {
        console.error('Failed to parse remote debugging list:', err);
        chrome.kill();
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('Failed to connect to Chrome debugging port 9222:', err.message);
    chrome.kill();
    process.exit(1);
  });
}, 3000);
