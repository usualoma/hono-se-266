import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
    return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Event Stream Example</title>
    </head>
    <body>
      <h1>Event Stream Example</h1>
      <div id="events"></div>
      <script>
        const eventSource = new EventSource('/events');
        eventSource.onmessage = function(event) {
          const eventsDiv = document.getElementById('events');
          const newElement = document.createElement('div');
          newElement.textContent = event.data;
          eventsDiv.appendChild(newElement);
          };
          eventSource.onerror = function(event) {
          console.error('EventSource failed:', event);
          };
          </script>
          </body>
          </html>
          `)
})

app.get('/events', (c) => {
    const stream = new ReadableStream({
        async start(controller) {
            controller.enqueue('data: first event\n\n')

            // Any async operation (DB query, API call, etc.)
            await new Promise(resolve => setTimeout(resolve, 5 * 1000))
            controller.enqueue('data: second event\n\n')
            controller.close()
        }
    })

    c.header('Content-Type', 'text/event-stream')
    return c.body(stream)
})

serve({
    fetch: app.fetch,
    overrideGlobalObjects: false,
})
