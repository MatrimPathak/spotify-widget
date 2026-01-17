declare module "node-vibrant" {
  export function from(image: string): {
    getPalette(): Promise<{
      [key: string]: {
        getHex(): string;
      } | null;
    }>;
  };
}
