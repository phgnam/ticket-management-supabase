"use client";
import { useEffect, useRef, useState } from "react";
import classes from "./TicketDetails.module.css";
import { getSupabaseBrowserClient } from "@/supabase-utils/browserClient";
import { getRandomHexString } from "@/utils/helpers";
import { urlPath } from "@/utils/url-helpers";

export function TicketComments({
  ticket,
  initialComments,
  tenant,
}: {
  ticket: number;
  initialComments: any[];
  tenant: any;
}) {
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseBrowserClient();
  const [comments, setComments] = useState(initialComments || []);
  const [fileList, setFileList] = useState<FileList | null>(null);

  useEffect(() => {
    const listener = (payload: any) => {
      const eventType = payload.eventType;
      if (eventType === "INSERT") {
        setComments((prevComments) => [...prevComments, payload.new]);
      } else if (eventType === "DELETE") {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== payload.old.id)
        );
      } else if (eventType === "UPDATE") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === payload.new.id ? payload.new : comment
          )
        );
      }
    };
    const attachmentsListener = (payload: any) => {
      const eventType = payload.eventType;
      if (eventType === "INSERT") {
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === payload.new.comment) {
              return {
                ...comment,
                comment_attachments: [
                  ...(comment.comment_attachments || []),
                  payload.new,
                ],
              };
            }
            return comment;
          })
        );
      }
    };

    const subscription = supabase
      .channel("my-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `ticket=eq.${ticket}`,
        },
        listener
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_attachments",
        },
        attachmentsListener
      )
      .subscribe((status) => console.log("connection status", status));

    return () => {
      // Wrap the unsubscribe call in an async function
      const unsubscribe = async (): Promise<void> => {
        await subscription.unsubscribe();
      };
      unsubscribe();
    };
  }, [supabase, ticket]);

  return (
    <footer>
      <h4>Comments ({comments.length})</h4>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (commentRef.current) {
            const comment_text = commentRef.current.value.trim();
            if (!comment_text) return alert("Please enter a comment");
            commentRef.current.disabled = true;
            let uploadPromise: any = Promise.resolve();
            if (fileList && fileList.length) {
              uploadPromise = Promise.all(
                Array.from(fileList).map((file) =>
                  supabase.storage
                    .from("comment-attachments")
                    .upload(
                      [tenant, ticket, getRandomHexString(), file.name].join(
                        "/"
                      ),
                      file
                    )
                )
              );
            }
            const fileUploads = await uploadPromise;
            console.log("fileUploads", fileUploads);
            supabase
              .from("comments")
              .insert({
                ticket,
                comment_text,
              })
              .select()
              .single()
              .then(({ error, data: commentData }) => {
                if (commentRef.current) {
                  commentRef.current.value = "";
                  commentRef.current.disabled = false;
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Add null check here
                  }
                  setFileList(null); // Corrected line
                }
                if (error) return alert("Error adding comment");
                if (fileUploads) {
                  supabase
                    .from("comment_attachments")
                    .insert(
                      fileUploads.map((file: any) => ({
                        comment: commentData.id,
                        file_path: file.data.path,
                      }))
                    )
                    .then();
                }
              });
          }
        }}
      >
        <textarea ref={commentRef} placeholder="Add a comment" />
        <label htmlFor="file">
          <input
            type="file"
            id="file"
            name="file"
            multiple
            onChange={(e) => {
              setFileList(e.target.files);
            }}
          />
        </label>

        <button type="submit">Add comment</button>
      </form>
      <section>
        {comments.map((comment) => (
          <article key={comment.id} className={classes.comment}>
            <strong>{comment.author_name} </strong>
            <time>{new Date(comment.created_at).toLocaleString("en-US")}</time>
            <p>{comment.comment_text}</p>
            {comment.comment_attachments?.length > 0 && (
              <>
                <small style={{ display: "block" }}>Attachments</small>
                {comment.comment_attachments.map(async (attachment: any) => (
                  <button
                    onClick={() => {
                      supabase.storage
                        .from("comment-attachments")
                        .createSignedUrl(attachment.file_path, 60, {
                          download: false,
                          transform: { width: 500, height: 500 },
                        })
                        .then(({ data, error }) => {
                          if (data) window.open(data.signedUrl, "_blank");
                        });
                    }}
                    key={attachment.id}
                    className="file-badge"
                  >
                    {attachment.file_path.split("/").pop()}
                    {attachment.file_path.endsWith(".jpeg") && (
                      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                      <img
                        style={{ marginLeft: "10px" }}
                        src={urlPath(
                          `/cdn?image=${attachment.file_path}`,
                          tenant
                        )}
                      />
                    )}
                  </button>
                ))}
              </>
            )}
          </article>
        ))}
      </section>
      <section>We have {comments.length} comments.</section>
    </footer>
  );
}
