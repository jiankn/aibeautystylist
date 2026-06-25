-- Store Stripe subscription period starts so quota windows can follow renewal dates.
ALTER TABLE subscriptions ADD COLUMN current_period_start TEXT;
