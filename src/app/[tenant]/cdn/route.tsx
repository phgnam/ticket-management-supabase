import { getSupabaseCookiesUtilClient } from "@/supabase-utils/cookiesUtilClient";
export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const image = searchParams.get("image");
  const supabase = getSupabaseCookiesUtilClient();
  const { data: cdnImage, error } = await supabase
    .from("comment_attachments")
    .select("file_path")
    .eq("file_path", image)
    .single();
  if (error) {
    return new Response("Error fetching image", { status: 500 });
  } else {
    return supabase.storage
      .from("comment-attachments")
      .download(cdnImage.file_path)
      .then(({ data: imageBlob, error }) => {
        console.log("imageBlob", imageBlob);
        return new Response(imageBlob);
      });
  }
}
