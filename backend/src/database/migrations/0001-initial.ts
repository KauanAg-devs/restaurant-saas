import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema0001 implements MigrationInterface {
  name = "InitialSchema0001";
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
    create extension if not exists pgcrypto;
    create table users (
      id uuid primary key default gen_random_uuid(),
      email varchar not null unique,
      password_hash varchar not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table restaurants (
      id uuid primary key default gen_random_uuid(),
      slug varchar not null unique,
      name varchar not null,
      tagline varchar not null default '',
      active boolean not null default true,
      whatsapp varchar not null default '',
      address_text varchar not null default '',
      accepts_delivery boolean not null default true,
      accepts_pickup boolean not null default true,
      delivery_fee numeric(10,2) not null default 0,
      minimum_order numeric(10,2) not null default 0,
      payment_methods text not null default '[]',
      opening_hours text not null default '{}',
      timezone varchar not null default 'America/Sao_Paulo',
      delivery_minutes_min int not null default 30,
      delivery_minutes_max int not null default 45,
      primary_color varchar not null default '#111111',
      secondary_color varchar not null default '#f4f4f4',
      background_color varchar not null default '#ffffff',
      surface_color varchar not null default '#ffffff',
      text_color varchar not null default '#171717',
      muted_text_color varchar not null default '#737373',
      background_pattern varchar not null default 'none',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table restaurant_members (
      id uuid primary key default gen_random_uuid(),
      restaurant_id uuid not null references restaurants(id) on delete cascade,
      user_id uuid not null references users(id) on delete cascade,
      role varchar not null default 'staff' check(role in ('owner','manager','staff')),
      unique(restaurant_id,user_id)
    );
    create index idx_members_user on restaurant_members(user_id);
    create index idx_members_restaurant on restaurant_members(restaurant_id);
    create table categories (
      id uuid primary key default gen_random_uuid(),
      restaurant_id uuid not null references restaurants(id) on delete cascade,
      slug varchar not null,
      name varchar not null,
      active boolean not null default true,
      sort_order int not null default 0,
      unique(restaurant_id,slug)
    );
    create index idx_categories_restaurant on categories(restaurant_id);
    create table products (
      id uuid primary key default gen_random_uuid(),
      restaurant_id uuid not null references restaurants(id) on delete cascade,
      category_id uuid not null references categories(id),
      slug varchar not null,
      name varchar not null,
      description text not null default '',
      price numeric(10,2) not null check(price>=0),
      image_url text,
      featured boolean not null default false,
      active boolean not null default true,
      available boolean not null default true,
      sort_order int not null default 0,
      unique(restaurant_id,slug)
    );
    create index idx_products_restaurant on products(restaurant_id);
    create index idx_products_category on products(category_id);
    create table product_addons (
      id uuid primary key default gen_random_uuid(),
      product_id uuid not null references products(id) on delete cascade,
      name varchar not null,
      price numeric(10,2) not null default 0 check(price>=0),
      active boolean not null default true,
      sort_order int not null default 0
    );
    create index idx_addons_product on product_addons(product_id);
    create sequence order_public_number_seq start 1000;
    create table orders (
      id uuid primary key default gen_random_uuid(),
      restaurant_id uuid not null references restaurants(id),
      public_number bigint not null default nextval('order_public_number_seq'),
      customer_name varchar not null,
      customer_phone varchar not null,
      fulfillment_type varchar not null check(fulfillment_type in ('delivery','pickup')),
      address_text text not null default '',
      notes text not null default '',
      payment_method varchar not null,
      payment_status varchar not null default 'pendente',
      status varchar not null default 'novo' check(status in ('novo','confirmado','preparando','pronto','saiu_para_entrega','concluido','cancelado')),
      subtotal numeric(10,2) not null,
      delivery_fee numeric(10,2) not null default 0,
      total numeric(10,2) not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index idx_orders_restaurant_created on orders(restaurant_id,created_at desc);
    create table order_items (
      id uuid primary key default gen_random_uuid(),
      order_id uuid not null references orders(id) on delete cascade,
      product_id uuid not null,
      product_name varchar not null,
      quantity int not null check(quantity>0),
      unit_price numeric(10,2) not null,
      addons_total numeric(10,2) not null default 0,
      addon_snapshot text not null default '[]'
    );
    create index idx_order_items_order on order_items(order_id);
  `);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`
      drop table if exists
        order_items,
        orders,
        product_addons,
        products,
        categories,
        restaurant_members,
        restaurants,
        users
      cascade;
      drop sequence if exists order_public_number_seq;
    `);
  }
}
