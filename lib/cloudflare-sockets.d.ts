// Typen für die Cloudflare-Socket-API (nur zur Laufzeit auf Cloudflare verfügbar).
declare module 'cloudflare:sockets' {
  export interface Socket {
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
    closed: Promise<void>;
    close(): Promise<void>;
    startTls(): Socket;
  }
  export function connect(
    address: { hostname: string; port: number },
    options?: { secureTransport?: 'off' | 'on' | 'starttls'; allowHalfOpen?: boolean },
  ): Socket;
}
