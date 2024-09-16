import { Ticket } from "@/app/[tenant]/tickets/details/[id]/page";
import { getSupabaseCookiesUtilClient } from "@/supabase-utils/cookiesUtilClient";
import { TICKET_STATUS } from "@/utils/constants";
import { urlPath } from "@/utils/url-helpers";
import Link from "next/link";

export async function TicketList({ tenant, searchParams }: any) {
  let page = 1;
  if (
    Number.isInteger(Number(searchParams.page)) &&
    Number(searchParams.page) > 0
  ) {
    page = Number(searchParams.page);
  }

  const supabase = getSupabaseCookiesUtilClient();
  let countStatement = supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("tenant", tenant);
  const startingPoint = (page - 1) * 6;
  let ticketsStatement = supabase.from("tickets").select().eq("tenant", tenant);
  const searchValue = searchParams.search?.trim();
  if (searchValue) {
    const cleanSearchString = searchValue
      .replaceAll('"', "")
      .replaceAll("\\", "")
      .replaceAll("%", "");
    const postgrestSearchValue = '"%' + cleanSearchString + '%"';
    const postgrestFilterString =
      `title.ilike.${postgrestSearchValue}` +
      `, description.ilike.${postgrestSearchValue}`;
    countStatement = countStatement.or(postgrestFilterString);
    ticketsStatement = ticketsStatement.or(postgrestFilterString);
  }
  // continue chaining order and range
  ticketsStatement = ticketsStatement
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .range(startingPoint, startingPoint + 5);
  const { count } = (await countStatement) as { count: number };
  const { data: tickets, error } = await ticketsStatement;
  const moreRows = count - page * 6 > 0;
  if (error) {
    console.error(error);
    return <div>Failed to fetch tickets</div>;
  }
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>ID</th> <th></th> <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket: any) => {
            const { id, title, status } = ticket as Ticket;
            return (
              <tr key={id}>
                <td>{id}</td>
                <td>
                  <Link href={urlPath(`/tickets/details/${id}`, tenant)}>
                    {title}
                  </Link>
                </td>
                <td>{TICKET_STATUS[status]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ display: "flex" }}>
        {page > 1 && (
          <Link
            role="button"
            href={{
              query: { page: page - 1 },
              search: searchParams.search,
            }}
          >
            Previous page
          </Link>
        )}
        {moreRows && (
          <Link
            style={{ marginLeft: "auto" }}
            role="button"
            href={{
              query: { page: page + 1 },
              search: searchParams.search,
            }}
          >
            Next page
          </Link>
        )}
      </div>
    </>
  );
}
