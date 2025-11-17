/**
 * Shared file upload utilities for Convex storage
 * Used for both inline editor uploads and featured image uploads
 */

export const FILE_CONSTRAINTS = {
  IMAGE: {
    TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    MAX_SIZE_MB: 10,
    MAX_SIZE_BYTES: 10 * 1024 * 1024,
  },
  VIDEO: {
    TYPES: ["video/mp4", "video/webm", "video/quicktime"],
    MAX_SIZE_MB: 50,
    MAX_SIZE_BYTES: 50 * 1024 * 1024,
  },
} as const;

export type FileType = "image" | "video";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file type and size constraints
 */
export function validateFile(file: File, fileType: FileType): ValidationResult {
  const constraints =
    FILE_CONSTRAINTS[fileType.toUpperCase() as keyof typeof FILE_CONSTRAINTS];

  // Check file type
  if (!(constraints.TYPES as readonly string[]).includes(file.type)) {
    const typesList = constraints.TYPES.map((t) =>
      t.split("/")[1].toUpperCase()
    ).join(", ");
    return {
      valid: false,
      error: `Invalid ${fileType} type. Allowed types: ${typesList}`,
    };
  }

  // Check file size
  if (file.size > constraints.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} size must be less than ${constraints.MAX_SIZE_MB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload file to Convex storage
 * Returns storage ID on success
 */
export async function uploadFileToConvex(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.storageId);
        } catch {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed due to network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was cancelled"));
    });

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * Generate a preview URL for a file (for local display before upload completes)
 */
export function generateFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get file type category (image or video)
 */
export function getFileTypeCategory(file: File): FileType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}
