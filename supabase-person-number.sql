-- 在 Supabase SQL Editor 中執行此腳本
-- 用途：在 entries 與 generated 各加一個欄位 person_number，代表「第幾位」寫下 journal 並產生禱告的人（51, 52, 53...）

-- entries：第幾位寫下日記的人
alter table entries add column if not exists person_number bigint;

-- generated：與對應的 entry 相同編號（同一筆禱告）
alter table generated add column if not exists person_number bigint;
