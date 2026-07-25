alter table package_drafts
  add column if not exists buyer_email text,
  add column if not exists company_name text;

update package_drafts as drafts
set
  buyer_email = buyers.email,
  company_name = coalesce(drafts.company_name, buyers.company_name)
from buyers
where drafts.buyer_id = buyers.id
  and (
    drafts.buyer_email is distinct from buyers.email
    or drafts.company_name is null
  );

create index if not exists idx_package_drafts_buyer_email
  on package_drafts (buyer_email);
