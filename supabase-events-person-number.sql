-- 在 Supabase SQL Editor 中執行此腳本
-- 用途：在 events 表與 events_with_content 視圖中加入 person_number 欄位

-- events 表：新增 person_number（寫入時由 API 從對應的 entry 帶入）
alter table events add column if not exists person_number bigint;

-- 先刪除舊視圖再重建（replace 不能改欄位順序，會報錯）
drop view if exists events_with_content;

-- 重建 events_with_content 視圖，加入 person_number（優先取自 events，沒有則取自 entries）
create view events_with_content as
select
  e.id as event_id,
  e.event_name,
  e.entry_id,
  e.session_id,
  coalesce(e.person_number, en.person_number) as person_number,
  e.meta,
  e.created_at as event_at,
  en.journal,
  g.reframe,
  g.prayer,
  g.blessing
from events e
left join entries en on en.id = e.entry_id
left join generated g on g.entry_id = e.entry_id
where e.event_name = 'click_download_blessing';
