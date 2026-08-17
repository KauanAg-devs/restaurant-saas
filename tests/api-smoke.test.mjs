import test from "node:test";
import assert from "node:assert/strict";

const API = process.env.API_URL;

test("public catalog contract stays healthy", { skip: !API }, async () => {
  const response = await fetch(`${API}/catalog?restaurant=sabor-da-casa`, {
    headers: { accept: "application/json" },
  });
  assert.equal(response.status, 200);
  assert.ok(
    response.headers.get("x-request-id"),
    "API should expose a request id",
  );
  const data = await response.json();
  assert.equal(typeof data?.restaurant?.is_open, "boolean");
  assert.equal(data?.restaurant?.slug, "sabor-da-casa");
  assert.ok(Array.isArray(data?.categories));
  assert.ok(Array.isArray(data?.products));
});

test("unknown tenant does not leak a catalog", { skip: !API }, async () => {
  const response = await fetch(
    `${API}/catalog?restaurant=tenant-that-must-not-exist`,
    { headers: { accept: "application/json" } },
  );
  assert.equal(response.status, 404);
  const data = await response.json();
  assert.equal(data?.code, "restaurant_not_found");
});
