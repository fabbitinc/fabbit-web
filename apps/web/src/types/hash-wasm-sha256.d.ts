declare module "hash-wasm/dist/sha256.umd.min.js" {
  export interface HashWasmSha256Hasher {
    init: () => HashWasmSha256Hasher;
    update: (data: Uint8Array | string) => HashWasmSha256Hasher;
    digest: (outputType?: "hex" | "binary") => string | Uint8Array;
    save: () => Uint8Array;
    load: (state: Uint8Array) => HashWasmSha256Hasher;
    blockSize: number;
    digestSize: number;
  }

  interface HashWasmSha256Module {
    createSHA256: () => Promise<HashWasmSha256Hasher>;
    sha256: (data: Uint8Array | string) => Promise<string>;
  }

  const hashWasmSha256: HashWasmSha256Module;

  export default hashWasmSha256;
}
