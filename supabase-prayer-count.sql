-- 在 Supabase SQL Editor 中執行此腳本
-- 用途：建立禱告人次計數表，起始值 50

-- 單一列計數表（id 固定為 1，count 起始 50）
create table if not exists prayer_count (
  id smallint primary key default 1 check (id = 1),
  count bigint not null default 50
);

-- 若表為空則寫入起始值 50；若已有列則不覆蓋
insert into prayer_count (id, count) values (1, 50)
on conflict (id) do nothing;

-- 每次有人成功生成禱告時呼叫此函數，count +1 並回傳新值
create or replace function increment_prayer_count()
returns bigint
language plpgsql
security definer
as $$
begin
  update prayer_count set count = count + 1 where id = 1;
  return (select count from prayer_count where id = 1);
end;
$$;
