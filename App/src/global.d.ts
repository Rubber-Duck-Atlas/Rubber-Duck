export {};

declare global {
  type RubberDuckResult = {
    query: string;
    answer?: string;
    results: Array<{
      path: string;
      score: number;
      snippet: string;
    }>;
  };

  interface Window {
    api: {
      runRubberDuckQuery(query: string): Promise<RubberDuckResult>;
      listFiles(dir: string): Promise<string[]>;
      getDocuments(): Promise<string[]>;
      getNotes(): Promise<string[]>;
      openAndAddFiles(isNote: boolean): Promise<string[]>;
      moveFile(fileName: string, isNote: boolean): Promise<{ documents: string[]; notes: string[] }>;
      deleteFile(fileName: string, isNote: boolean): Promise<{ documents: string[]; notes: string[] }>;
      readFileContent(fileName: string, isNote: boolean): Promise<string>;
      saveNote(fileName: string, content: string): Promise<string[]>;
      saveFile(fileName: string, content: string, isNote: boolean): Promise<string[]>;
    };
  }
}