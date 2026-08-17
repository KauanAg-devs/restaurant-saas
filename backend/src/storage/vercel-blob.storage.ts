import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { put } from "@vercel/blob";
import { ObjectStorage } from "./object-storage";

@Injectable()
export class VercelBlobStorage implements ObjectStorage {
  async uploadPublic(pathname: string, body: Buffer, contentType: string) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new ServiceUnavailableException(
        "Armazenamento de imagens não configurado.",
      );
    }

    const blob = await put(pathname, body, {
      access: "public",
      contentType,
      token,
      addRandomSuffix: false,
    });

    return { url: blob.url };
  }
}
