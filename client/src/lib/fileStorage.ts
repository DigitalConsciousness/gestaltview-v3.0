import { FILE_CAP } from "@/lib/constants";
import {
  deleteUserFileFromServer as deleteUserFileFromInnerWorldServer,
  loadUserFilesFromServer as loadUserFilesFromInnerWorldServer,
  uploadUserFileToServer as uploadUserFileToInnerWorldServer,
  readUserFiles,
  type UserFileRecord,
} from "@/lib/innerWorldFiles";

export async function listUserFiles(): Promise<UserFileRecord[] | null> {
  return loadUserFilesFromInnerWorldServer();
}

export async function uploadUserFileToServer(
  input: Parameters<typeof uploadUserFileToInnerWorldServer>[0],
): Promise<UserFileRecord | null> {
  if (readUserFiles().length >= FILE_CAP) {
    throw new Error(
      "You've reached your 300-file limit. Delete files to upload more, or upgrade your plan for additional storage.",
    );
  }

  return uploadUserFileToInnerWorldServer(input);
}

export async function deleteUserFileFromServer(fileId: string): Promise<boolean> {
  return deleteUserFileFromInnerWorldServer(fileId);
}

export { FILE_CAP };
