CREATE TABLE predictive_forecasts(id uuid PRIMARY KEY,tenant_id uuid,forecast_type text,horizon_days integer,payload jsonb);
CREATE TABLE customer_churn_scores(id uuid PRIMARY KEY,tenant_id uuid,customer_id uuid,score numeric,last_calculated timestamptz);
CREATE TABLE technician_performance_scores(id uuid PRIMARY KEY,tenant_id uuid,technician_id uuid,score numeric,metrics jsonb);
CREATE TABLE inventory_predictions(id uuid PRIMARY KEY,tenant_id uuid,item_id uuid,predicted_quantity numeric,prediction_date date);
CREATE TABLE business_recommendations(id uuid PRIMARY KEY,tenant_id uuid,category text,recommendation text,priority text);
