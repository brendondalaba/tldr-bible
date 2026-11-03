-- Let a signed-in reader permanently delete their own account.
-- Deleting the auth user cascades to their chapter_reads and book_completions
-- (both reference auth.users with on delete cascade).
--
-- security definer: readers can't touch auth.users directly, so this runs with
-- the owner's rights, but it only ever deletes the caller's own row.

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not signed in';
  end if;

  delete from auth.users where id = v_user;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
