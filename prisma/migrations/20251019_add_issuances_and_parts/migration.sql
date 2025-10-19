-- Manual migration: add issuances and issuance_parts tables

CREATE TABLE IF NOT EXISTS public.issuances (
    id serial PRIMARY KEY,
    issuance_number character varying(50) NOT NULL,
    date_issued date DEFAULT CURRENT_DATE NOT NULL,
    technician_name character varying(100) NOT NULL,
    recipient character varying(200),
    issued_by character varying(100),
    service_job character varying(200),
    car_details text,
    notes text,
    total_quantity integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE IF EXISTS public.issuances
    ADD CONSTRAINT issuances_issuance_number_key UNIQUE (issuance_number);


CREATE TABLE IF NOT EXISTS public.issuance_parts (
    id serial PRIMARY KEY,
    issuance_id integer,
    product_id integer,
    quantity integer NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT issuance_parts_quantity_check CHECK ((quantity > 0))
);

ALTER TABLE IF EXISTS public.issuance_parts
    ADD CONSTRAINT issuance_parts_issuance_id_product_id_key UNIQUE (issuance_id, product_id);

-- Foreign keys
ALTER TABLE IF EXISTS public.issuance_parts
    ADD CONSTRAINT issuance_parts_issuance_id_fkey FOREIGN KEY (issuance_id) REFERENCES public.issuances(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.issuance_parts
    ADD CONSTRAINT issuance_parts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

-- End of migration
