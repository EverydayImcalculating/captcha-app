export {};

declare global {
  interface FileSystemHandle {
    queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
    requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    createWritable: (options?: { keepExistingData?: boolean }) => Promise<FileSystemWritableFileStream>;
    getFile: () => Promise<File>;
  }

  interface Window {
    showSaveFilePicker: (options?: any) => Promise<FileSystemFileHandle>;
  }
}
