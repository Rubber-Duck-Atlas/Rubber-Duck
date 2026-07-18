export {};

declare global {
  interface Window {
    api: {
      listFiles(dir: string): Promise<string[]>;
      getDocuments(): Promise<string[]>;
      getNotes(): Promise<string[]>;
      addFile(filePath: string, isNote: boolean): Promise<string>;
    };
  }
}