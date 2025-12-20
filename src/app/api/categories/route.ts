import { NextRequest, NextResponse } from "next/server";
import {
  blogCategories,
  galleryCategories,
  getCategoriesByType,
} from "@/lib/categoryData";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "gallery" || type === "blog") {
    return NextResponse.json(getCategoriesByType(type));
  }

  if (type) {
    return NextResponse.json(
      { error: "type must be 'gallery' or 'blog'" },
      { status: 400 }
    );
  }

  return NextResponse.json([...galleryCategories, ...blogCategories]);
}
