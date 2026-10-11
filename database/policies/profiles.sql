create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);
                                   
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
                             
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
                            
create policy "Admins can delete profiles"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );