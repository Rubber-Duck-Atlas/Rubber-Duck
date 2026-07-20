export {};

declare global {
  interface Window {
    api: {
      listFiles(dir: string): Promise<string[]>;
      getDocuments(): Promise<string[]>;
      getNotes(): Promise<string[]>;
      openAndAddFiles(isNote: boolean): Promise<string[]>;
      moveFile(fileName: string, isNote: boolean): Promise<{ documents: string[]; notes: string[] }>;
      deleteFile(fileName: string, isNote: boolean): Promise<{ documents: string[]; notes: string[] }>;
      readFileContent(fileName: string, isNote: boolean): Promise<string>;
    };
  }
}