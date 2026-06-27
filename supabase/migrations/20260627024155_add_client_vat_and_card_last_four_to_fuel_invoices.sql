-- Add client VAT number and card last four digits to fuel_transaction_invoices
ALTER TABLE fuel_transaction_invoices
  ADD COLUMN IF NOT EXISTS client_vat_number text,
  ADD COLUMN IF NOT EXISTS card_last_four_digits text;

-- Backfill client_vat_number from organizations
UPDATE fuel_transaction_invoices fti
SET client_vat_number = o.vat_number
FROM organizations o
WHERE fti.organization_id = o.id
  AND o.vat_number IS NOT NULL
  AND fti.client_vat_number IS NULL;

-- Backfill card_last_four_digits from payment cards via fuel_transactions
UPDATE fuel_transaction_invoices fti
SET card_last_four_digits = opc.last_four_digits
FROM fuel_transactions ft
JOIN organization_payment_cards opc ON opc.id = ft.fuel_card_id
WHERE fti.fuel_transaction_id = ft.id
  AND opc.last_four_digits IS NOT NULL
  AND fti.card_last_four_digits IS NULL;
