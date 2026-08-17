export const OBJECT_STORAGE = Symbol("OBJECT_STORAGE");

export interface ObjectStorage {
  uploadPublic(
    pathname: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ url: string }>;
}
