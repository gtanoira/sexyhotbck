import { BadRequestException } from "@nestjs/common";
import { memoryStorage } from "multer";

// Multer upload options
export const oneFileMemoryMulterOptions = {
  // Enable file size limits
  /* limits: {
      fileSize: +process.env.MAX_FILE_SIZE,
  }, */
  // Chequear los mimetype permitidos de los archivos para upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/xml$/)) {
      // Grabar el archivo
      cb(null, true);
    } else {
      // Rechazar archivo
      cb(new BadRequestException(`GS-001(E): only XML files are available.`), false);
    }
  },
  // Storage properties
  storage: memoryStorage()
};

