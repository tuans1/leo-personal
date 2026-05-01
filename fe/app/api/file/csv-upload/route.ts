import { NextResponse, type NextRequest } from "next/server";
import { CsvUploadFormField } from "@/app/file/csv.constants";

function isCsvFile(file: File): boolean {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return false;
  }
  if (!file.type) {
    return true;
  }
  return (
    file.type === "text/csv" ||
    file.type === "application/csv" ||
    file.type === "text/comma-separated-values" ||
    file.type === "text/plain" ||
    file.type === "application/vnd.ms-excel"
  );
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data" }, { status: 400 });
  }

  const entry = form.get(CsvUploadFormField.File);
  if (entry == null) {
    return NextResponse.json({ message: "Missing file" }, { status: 400 });
  }
  if (!(entry instanceof File)) {
    return NextResponse.json({ message: "Invalid file" }, { status: 400 });
  }
  if (entry.size === 0) {
    return NextResponse.json({ message: "File is empty" }, { status: 400 });
  }
  if (!isCsvFile(entry)) {
    return NextResponse.json({ message: "Chỉ chấp nhận file .csv" }, { status: 400 });
  }

  return NextResponse.json({
    success: true as const,
    name: entry.name,
    size: entry.size,
  });
}
