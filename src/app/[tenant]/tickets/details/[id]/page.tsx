import TicketDetails from "@/app/[tenant]/tickets/details/[id]/TicketDetails";
import { getSupabaseCookiesUtilClient } from "@/supabase-utils/cookiesUtilClient";
import { TICKET_STATUS } from "@/utils/constants";
import { notFound } from "next/navigation";

type Params = {
  id: string;
};

export type Ticket = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  created_by: string;
  status: keyof typeof TICKET_STATUS;
  author_name: string;
  comments: any[];
};

export default async function TicketDetailsPage({
  params,
}: {
  params: Params;
}) {
  const supabase = getSupabaseCookiesUtilClient();
  const id = Number(params.id);
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*, comments (*, comment_attachments (*) )")
    .order("created_at", { ascending: true, referencedTable: "comments" })
    .eq("id", id)
    .single();
  if (error) return notFound();
  const {
    created_at,
    title,
    description,
    created_by,
    status,
    author_name,
    comments,
  } = ticket as Ticket;
  const dateString = new Date(created_at).toLocaleString("en-US");
  const supabase_user_id = (await supabase.auth.getUser())?.data?.user?.id;
  const { data: serviceUser, error: serviceUserError } = await supabase
    .from("service_users")
    .select("id")
    .eq("supabase_user", supabase_user_id)
    .single();
  console.log("serviceUser", serviceUser);
  if (serviceUserError) return notFound();
  const isAuthor = serviceUser.id === ticket.created_by;
  return (
    <TicketDetails
      tenant={ticket.tenant}
      id={id}
      title={title}
      description={description}
      status={status}
      author_name={author_name}
      dateString={dateString}
      isAuthor={isAuthor}
      assignee={ticket.assignee}
      initialComments={comments}
    />
  );
}
