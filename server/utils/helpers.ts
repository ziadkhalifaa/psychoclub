import fs from "fs";
import path from "path";
import prisma from "../prisma.js";

/**
 * Log an audit action to the database.
 */
export const logAudit = async (actorId: string | null, action: string, entityType: string, entityId?: string) => {
  try {
    await prisma.auditLog.create({ data: { actorId, action, entityType, entityId } });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
};

/**
 * Delete a physical file from the uploads directory.
 */
export const deleteFile = (url: string | null | undefined) => {
  if (!url) return;
  try {
    // Check if it's a local upload
    if (url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`Failed to delete file ${url}:`, err);
  }
};
