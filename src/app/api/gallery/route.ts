// import { NextRequest, NextResponse } from "next/server";
// import {
//   getAllGalleryImages,
//   getGalleryImageById,
//   getGalleryImagesByCategory,
// } from "@/lib/galleryData";

// export function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const idParam = searchParams.get("id");
//   const category = searchParams.get("category");

//   if (idParam) {
//     const id = Number(idParam);
//     if (!Number.isFinite(id)) {
//       return NextResponse.json({ error: "id must be a number" }, { status: 400 });
//     }

//     const image = getGalleryImageById(id);
//     if (!image) {
//       return NextResponse.json({ error: "image not found" }, { status: 404 });
//     }

//     return NextResponse.json(image);
//   }

//   if (category && category !== "All") {
//     return NextResponse.json(getGalleryImagesByCategory(category));
//   }

//   return NextResponse.json(getAllGalleryImages());
// }
