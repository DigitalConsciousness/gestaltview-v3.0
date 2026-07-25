declare module "node:crypto" {
  export function createHash(algorithm: string): {
    update(data: Uint8Array | string): { digest(encoding: "hex"): string };
  };
}

declare module "node:fs/promises" {
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<unknown>;
  export function writeFile(path: string, data: Uint8Array | string, encoding?: string): Promise<void>;
  export function readFile(path: string | URL, encoding?: string): Promise<string>;
  export function mkdtemp(prefix: string): Promise<string>;
}

declare module "node:path" {
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
}

declare const process: { argv: string[]; exitCode?: number };
declare const Buffer: {
  byteLength(value: string): number;
  from(value: string, encoding?: string): Uint8Array;
  from(value: Uint8Array): Uint8Array;
};
