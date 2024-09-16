import TenantName from "./TenantName";
import Nav from "./Nav";
export default function TicketsLayout(pageProps: any) {
  return (
    <>
      <section style={{ borderBottom: "1px solid gray" }}>
        <TenantName tenant={pageProps.params.tenant} />
        <Nav tenant={pageProps.params.tenant} />
      </section>
      <section>{pageProps.children}</section>
    </>
  );
}
