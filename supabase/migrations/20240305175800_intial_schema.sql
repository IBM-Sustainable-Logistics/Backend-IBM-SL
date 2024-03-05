create table "public"."estimates" (
    "id" bigint generated always as identity not null,
    "transport_method" text,
    "distance_km" bigint,
    "estimate" bigint
);


CREATE UNIQUE INDEX estimates_pkey ON public.estimates USING btree (id);

alter table "public"."estimates" add constraint "estimates_pkey" PRIMARY KEY using index "estimates_pkey";

grant delete on table "public"."estimates" to "anon";

grant insert on table "public"."estimates" to "anon";

grant references on table "public"."estimates" to "anon";

grant select on table "public"."estimates" to "anon";

grant trigger on table "public"."estimates" to "anon";

grant truncate on table "public"."estimates" to "anon";

grant update on table "public"."estimates" to "anon";

grant delete on table "public"."estimates" to "authenticated";

grant insert on table "public"."estimates" to "authenticated";

grant references on table "public"."estimates" to "authenticated";

grant select on table "public"."estimates" to "authenticated";

grant trigger on table "public"."estimates" to "authenticated";

grant truncate on table "public"."estimates" to "authenticated";

grant update on table "public"."estimates" to "authenticated";

grant delete on table "public"."estimates" to "service_role";

grant insert on table "public"."estimates" to "service_role";

grant references on table "public"."estimates" to "service_role";

grant select on table "public"."estimates" to "service_role";

grant trigger on table "public"."estimates" to "service_role";

grant truncate on table "public"."estimates" to "service_role";

grant update on table "public"."estimates" to "service_role";


