import React from "react";

export function PostgresLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.84 2.16 7.18 5.34 8.86-.06-.71-.06-1.57.17-2.32l1.39-5.91s-.36-.71-.36-1.76c0-1.65.96-2.88 2.15-2.88 1.02 0 1.51.76 1.51 1.68 0 1.02-.65 2.56-.99 3.98-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5.01-4.88-3.41 0-5.42 2.56-5.42 5.2 0 1.03.4 2.13.89 2.73.1.12.11.23.08.35l-.33 1.37c-.05.22-.18.27-.41.16-1.52-.71-2.47-2.93-2.47-4.72 0-3.84 2.79-7.37 8.05-7.37 4.23 0 7.51 3.01 7.51 7.04 0 4.2-2.65 7.58-6.33 7.58-1.24 0-2.4-.64-2.8-1.4l-.76 2.91c-.28 1.06-1.03 2.39-1.54 3.21C9.64 21.84 10.8 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export function KubernetesLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.5l7.79 4.5v9L12 20.5 4.21 16v-9L12 2.5zm0 2.3L6.2 8.16v6.68L12 18.2l5.8-3.36V8.16L12 4.8zm0 2.2a4.99 4.99 0 014.28 2.47l-1.9 1.1A2.8 2.8 0 0012 9.2a2.8 2.8 0 00-2.38 1.37l-1.9-1.1A5 5 0 0112 7zm-5 5.5c0-.85.22-1.65.6-2.35l1.9 1.1a2.8 2.8 0 000 2.5l-1.9 1.1A4.96 4.96 0 017 12.5zm10 0c0 .85-.22 1.65-.6 2.35l-1.9-1.1a2.8 2.8 0 000-2.5l1.9-1.1c.38.7.6 1.5.6 2.35zm-5 5.5a4.99 4.99 0 01-4.28-2.47l1.9-1.1A2.8 2.8 0 0012 15.8a2.8 2.8 0 002.38-1.37l1.9 1.1A5 5 0 0112 18z" />
    </svg>
  );
}

export function DockerLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.98 11.08h1.86v1.86h-1.86v-1.86zm-2.48 0h1.86v1.86H11.5v-1.86zm-2.48 0h1.86v1.86H9.02v-1.86zm-2.48 0h1.86v1.86H6.54v-1.86zm-2.48 0h1.86v1.86H4.06v-1.86zm7.44-2.48h1.86v1.86H11.5V8.6zm-2.48 0h1.86v1.86H9.02V8.6zm-2.48 0h1.86v1.86H6.54V8.6zm4.96-2.48h1.86v1.86H11.5V6.12zM21.94 11.6c-.46-.32-1.46-.38-2.32-.14-.24-1.63-1.41-2.9-1.54-3.03l-.43-.43-.33.51c-.67 1.05-.75 2.33-.21 3.42-.42.23-1.12.39-1.78.43H1.47l-.37.38C.4 13.43 0 15.22 0 16.94c0 3.32 2.68 5.06 7.23 5.06 6.8 0 11.23-3.64 12.87-9.45.65.07 1.34.02 1.95-.29.47-.24.77-.52.79-.55l.23-.29-.13-.32c-.08-.19-.4-.44-1-.49z" />
    </svg>
  );
}

export function FastApiLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-5-6h3.5V6.5l5 6H13v4z" />
    </svg>
  );
}

export function OpenTelemetryLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-3.5-9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-3.5 5.5a4 4 0 01-3.5-2h7a4 4 0 01-3.5 2z" />
    </svg>
  );
}

export function KafkaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 00-9 9c0 4.28 3 7.86 7 8.74V18.6A6.99 6.99 0 015 12a7 7 0 1114 0c0 3.24-2.2 5.97-5.2 6.74v2.12c4.2-.9 7.2-4.66 7.2-8.86a9 9 0 00-9-9zm-1 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-2 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
    </svg>
  );
}

export function GrafanaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

export function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 6.5 9.2 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
      />
      <path
        fill="#FBBC05"
        d="M5.9 14.9c-.2-.7-.4-1.5-.4-2.4 0-.9.2-1.7.4-2.4L2.2 7.3C1.4 8.8 1 10.4 1 12.5s.4 3.7 1.2 5.2l3.7-2.8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-2.8 0-5.2-1.9-6.1-4.5L2.2 16.6C4 20.3 7.7 23 12 23z"
      />
    </svg>
  );
}

export function FirebaseLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4.5 18.2L7.3 3.5c.1-.5.7-.7 1.1-.3l3.3 5.4-7.2 9.6z"
        fill="#FFA000"
      />
      <path
        d="M14.2 8.7L11.7 4.1c-.2-.4-.8-.4-1 0L4.5 18.2l9.7-9.5z"
        fill="#F57C00"
      />
      <path
        d="M19.5 18.2l-5.3-9.5-9.7 9.5 7.5 4.3c.7.4 1.5.4 2.2 0l5.3-4.3z"
        fill="#FFCA28"
      />
    </svg>
  );
}

