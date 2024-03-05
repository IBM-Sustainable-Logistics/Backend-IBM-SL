create table estimates (
id bigint primary key generated always as identity,
transport_method text,
distance_km bigint,
estimate bigint
);