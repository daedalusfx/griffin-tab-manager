/// <reference types="electron-vite/node" />

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.web' {
  const content: string
  export default content
}


declare namespace JSX {
  interface IntrinsicElements {
    'webview': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src: string;
      useragent?: string;
      style?: React.CSSProperties;
      // می‌توان پراپرتی‌های دیگر webview را هم اینجا اضافه کرد
      // مثل: allowpopups, preload, etc.
    };
  }
}