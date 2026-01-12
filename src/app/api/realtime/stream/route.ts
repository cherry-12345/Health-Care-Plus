export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Store globally for other APIs to use
      (globalThis as any).sendRealtimeUpdate = send;

      // Send initial connection message
      send({ type: "CONNECTED", timestamp: new Date() });

      // Keep connection alive
      const keepAlive = setInterval(() => {
        send({ type: "HEARTBEAT", timestamp: new Date() });
      }, 30000);

      // Cleanup on close
      const cleanup = () => {
        clearInterval(keepAlive);
        delete (globalThis as any).sendRealtimeUpdate;
      };

      // Store cleanup function
      (globalThis as any).cleanupRealtime = cleanup;
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control"
    }
  });
}