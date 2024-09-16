import { TicketFilters } from "@/app/[tenant]/tickets/TicketFilters";
import { TicketList } from "@/app/[tenant]/tickets/TicketList";
import { Suspense } from "react";

const dummyTickets = [
  {
    id: 1,
    title: "Write Supabase Book",
    status: "Not started",
    author: "Chayan",
  },
  {
    id: 2,
    title: "Read more Packt Books",
    status: "In progress",
    author: "David",
  },
  {
    id: 3,
    title: "Make videos for the YouTube Channel",
    status: "Done",
    author: "David",
  },
];

export const dynamic = "force-dynamic";

export default function TicketListPage({
  params,
  searchParams,
}: {
  params: {
    tenant: string;
  };
  searchParams: {
    page: number;
  };
}) {
  return (
    <>
      <h2>Ticket List</h2>
      <TicketFilters tenant={params.tenant} />
      <Suspense
        fallback={<div aria-busy="true">Loading tickets...</div>}
        key={JSON.stringify(searchParams)}
      >
        <TicketList tenant={params.tenant} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
