-- 1. 建立站點計數表（key-value，方便之後擴充其他計數）
create table if not exists site_stats (
  key text primary key,
  value integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 2. 設定 count_people 起始值為 50（僅在該 key 尚不存在時插入，若已存在則不覆寫）
insert into site_stats (key, value, updated_at)
values ('count_people', 50, now())
on conflict (key) do nothing;

-- 3. 建立「+1」函數，每次有人成功產生一篇禱告時由 API 呼叫
create or replace function increment_count_people()
returns integer
language plpgsql
security definer
as $$
declare
  new_val integer;
begin
  update site_stats
  set value = value + 1, updated_at = now()
  where key = 'count_people'
  returning value into new_val;
  return new_val;
end;
$$;
