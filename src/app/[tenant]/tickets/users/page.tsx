import { getSupabaseCookiesUtilClient } from "@/supabase-utils/cookiesUtilClient";
import { IconCheck, IconUserOff } from "@tabler/icons-react";

const users = [
  {
    name: "Alice Ling",
    job: "Software Engineer",
    isAvailable: false,
  },
  // ... add as much users as you want
];
export default async function UserList({ params }: any) {
  const supabase = getSupabaseCookiesUtilClient();
  const { data: users, error } = await supabase.rpc("get_tenant_userlist", {
    tenant_id: params.tenant,
  });
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Job</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user: any) => (
          <tr key={user.id}>
            <td style={{ color: !user.is_available ? "red" : undefined }}>
              {user.is_available ? <IconCheck /> : <IconUserOff />}
              {user.full_name}
            </td>
            <td>{user.job_title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
