CREATE TABLE usage (
  id          TEXT,
  usage_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY(id, usage_date)
);

CREATE TABLE error_report (
  id              SERIAL PRIMARY KEY,
  error_message   TEXT,
  stack           TEXT,
  battle          JSON,
	created         TIMESTAMP NOT NULL DEFAULT now()
);