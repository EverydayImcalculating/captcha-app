import { getFileHandle } from "@/lib/fileHandleStorage";
import { TestResult } from "@/lib/store";

export const downloadCSV = (results: TestResult[]) => {
  const headers = [
    "Round",
    "Type",
    "Time (ms)",
    "Accuracy",
    "Test ID",
    "User Response",
    "Correct Answer",
    "Frustration",
  ];
  const rows = results.map((r) => [
    r.round,
    r.type,
    r.timeTaken,
    r.accuracy ? "Pass" : "Fail",
    r.testID ?? "",
    r.userResponse,
    r.correctAnswer,
    r.frustrationScore,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `captcha-test-results-${new Date().toISOString()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const getNextParticipantID = async (fileHandle: FileSystemFileHandle) => {
  const file = await fileHandle.getFile();
  const text = await file.text();

  // ถ้าไฟล์ว่าง → คนแรก
  if (!text.trim()) return 1;

  const lines = text.trim().split("\n");

  // มีแค่ header → คนแรก
  if (lines.length <= 1) return 1;

  // เอา row สุดท้าย
  const lastRow = lines[lines.length - 1];

  // CSV column แรกคือ participantID
  const lastID = Number(lastRow.split(",")[0]);

  if (isNaN(lastID)) return 1;

  return lastID + 1;
};

export const loadHandle = async () => {
  const handle = await getFileHandle();
  if (!handle) return null;

  // ขอ permission ใหม่
  const permission = await handle.requestPermission?.({
    mode: "readwrite",
  });

  if (permission !== "granted") return null;

  return handle;
};

export const appendResultsToFile = async (results: TestResult[]) => {
  const fileHandle = await getFileHandle();

  if (!fileHandle) {
    throw new Error("File handle not found. Please choose a file first.");
  }

  const participantID = await getNextParticipantID(fileHandle);

  const headers = [
    "Participant ID",
    "Round",
    "Type",
    "Time (ms)",
    "Accuracy",
    "Test ID",
    "User Response",
    "Correct Answer",
    "Frustration",
  ];

  const rows = results.map((r) =>
    [
      participantID,
      r.round,
      r.type,
      r.timeTaken,
      r.accuracy ? "Pass" : "Fail",
      r.testID ?? "",
      r.userResponse,
      r.correctAnswer,
      r.frustrationScore,
    ].join(","),
  );

  const writable = await fileHandle.createWritable({
    keepExistingData: true,
  });

  // move pointer ไปท้ายไฟล์
  const file = await fileHandle.getFile();
  const isEmpty = file.size === 0;

  await writable.seek(file.size);

  // ถ้าไฟล์ยังไม่มีข้อมูล → ใส่ header
  if (isEmpty) {
    await writable.write(headers.join(",") + "\n");
  } else {
    await writable.write("\n"); // ป้องกันชน
  }

  // append rows
  await writable.write(rows.join("\n"));

  await writable.close();
};
