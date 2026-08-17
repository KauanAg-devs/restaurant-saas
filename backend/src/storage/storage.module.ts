import { Module } from "@nestjs/common";
import { OBJECT_STORAGE } from "./object-storage";
import { VercelBlobStorage } from "./vercel-blob.storage";

@Module({
  providers: [
    VercelBlobStorage,
    { provide: OBJECT_STORAGE, useExisting: VercelBlobStorage },
  ],
  exports: [OBJECT_STORAGE],
})
export class StorageModule {}
