begin;

drop policy if exists authenticated_owner on public."DashboardLayout";

create policy authenticated_owner
on public."DashboardLayout"
for all
to authenticated
using (
  exists (
    select 1
    from public."User" u
    where u.auth_user_id = public."DashboardLayout"."userId"
      and u.auth_user_id = (select auth.uid())::text
  )
)
with check (
  exists (
    select 1
    from public."User" u
    where u.auth_user_id = public."DashboardLayout"."userId"
      and u.auth_user_id = (select auth.uid())::text
  )
);

commit;
