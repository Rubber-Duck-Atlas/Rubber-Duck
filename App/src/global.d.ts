export {};

declare global {
  interface Window {
    api: {
      listFiles(dir: string): Promise<string[]>;
    };
  }
}