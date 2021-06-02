CREATE TABLE usage (
  id text,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY(id, usage_date)
);