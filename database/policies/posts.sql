create policy "Public can read published posts"
  on public.posts for select
  using (status = 'published');

create policy "Authors can read own posts"
  on public.posts for select
  using (auth.uid() = author_id);
                          
create policy "Admins can read all posts"
  on public.posts for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
                                                 
create policy "Authors can create posts"
  on public.posts for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'author')
    )
  );
                                  
create policy "Authors can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);
                          
create policy "Admins can update any post"
  on public.posts for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
                                  
create policy "Authors can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);
                             
create policy "Admins can delete any post"
  on public.posts for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
                                     
create policy "Public can read post_tags for published posts"
  on public.post_tags for select
  using (
    exists (
      select 1 from public.posts
      where id = post_id and status = 'published'
    )
  );

create policy "Authors can manage own post_tags"
  on public.post_tags for all
  using (
    exists (
      select 1 from public.posts
      where id = post_id and author_id = auth.uid()
    )
  );

create policy "Admins can manage all post_tags"
  on public.post_tags for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
