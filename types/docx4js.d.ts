declare module 'docx4js' {
  interface DocxDocument {
    getFullText(): string;
  }

  function load(filePath: string): Promise<DocxDocument>;

  export default {
    load
  };
} 