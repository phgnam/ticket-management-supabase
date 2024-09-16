"use client";
import { getSupabaseBrowserClient } from "@/supabase-utils/browserClient";
import { useEffect, useState } from "react";
export function AssigneeSelect({ tenant, onValueChanged, initialValue }: any) {
  const [users, setUsers] = useState([]);
  const supabase = getSupabaseBrowserClient();
  useEffect(() => {
    supabase
      .rpc("get_tenant_userlist", { tenant_id: tenant })
      .then(({ data }) => {
        setUsers(data ?? []);
      });
  }, [supabase, tenant]);
  return (
    <select
      value={initialValue === null ? "" : initialValue}
      name="assignee"
      disabled={users === null}
      onChange={(e) => {
        const v = e.target.value;
        onValueChanged(v === "" ? null : v);
      }}
    >
      <option value="">{users === null ? "Loading..." : "No assignee"}</option>
      {users &&
        users.map((user: any) => {
          return (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          );
        })}
    </select>
  );
}
