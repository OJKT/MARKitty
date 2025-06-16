declare module 'docxtemplater-image-module-free' {
  interface ImageModuleOptions {
    centered?: boolean;
    getImage(tagValue: string): string | Uint8Array | ArrayBuffer;
    getSize(image: any, tagValue: string): [number, number];
  }

  class ImageModule {
    constructor(options: ImageModuleOptions);
  }

  export = ImageModule;
} 