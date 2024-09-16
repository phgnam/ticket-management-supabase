"use client";

import { TicketComments } from "@/app/[tenant]/tickets/details/[id]/TicketComments";
import classes from "./TicketDetails.module.css";
import { TICKET_STATUS } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { urlPath } from "@/utils/url-helpers";
import { getSupabaseBrowserClient } from "@/supabase-utils/browserClient";
import { AssigneeSelect } from "@/components/AssigneeSelect";

export default function TicketDetails({
  tenant,
  id,
  title,
  description,
  status,
  author_name,
  dateString,
  isAuthor,
  assignee,
  initialComments,
}: {
  tenant: string;
  id: number;
  title: string;
  description: string;
  status: keyof typeof TICKET_STATUS;
  author_name: string;
  dateString: string;
  isAuthor: boolean;
  assignee: string;
  initialComments: any[];
}) {
  const supabase = getSupabaseBrowserClient();

  const router = useRouter();
  return (
    <article className={classes.ticketDetails}>
      <header>
        <div className="grid">
          <div>
            <strong>#{id}</strong> -{" "}
            <strong className={classes.ticketStatusGreen}>
              {TICKET_STATUS[status]}{" "}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
            }}
          >
            <AssigneeSelect
              tenant={tenant}
              onValueChanged={(v: any) => {
                supabase
                  .from("tickets")
                  .update({
                    assignee: v,
                  })
                  .eq("id", id)
                  .then(() => router.refresh());
              }}
              initialValue={assignee}
            />
          </div>
          {isAuthor && (
            <button
              role="button"
              className="little-danger"
              onClick={() => {
                supabase
                  .from("tickets")
                  .delete()
                  .eq("id", id)
                  .then(() => {
                    router.push(urlPath("/tickets", tenant));
                  });
              }}
            >
              Delete ticket
            </button>
          )}
        </div>
        <br />
        <small className={classes.authorAndDate}>
          Created by <strong>{author_name}</strong> at
          <time>{dateString}</time>
        </small>
        <h2>{title}</h2>
      </header>
      <section>{description}</section>
      <TicketComments
        ticket={id}
        initialComments={initialComments}
        tenant={tenant}
      />
    </article>
  );
}
