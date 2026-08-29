import test from "node:test";
import assert from "node:assert/strict";

import {
  ADMIN_ROLES,
  isAdminRoute,
  isAuthorizedAdminRole,
} from "./admin-auth";

test("admin roles include the required role set", () => {
  assert.deepEqual(ADMIN_ROLES, [
    "SUPER_ADMIN",
    "FESTIVAL_ADMIN",
    "POOJA_ADMIN",
    "EVENT_ADMIN",
    "VIEWER",
  ]);
});

test("admin route matcher protects all admin pages except the login screen", () => {
  assert.equal(isAdminRoute("/admin/dashboard"), true);
  assert.equal(isAdminRoute("/admin/login"), false);
  assert.equal(isAdminRoute("/public"), false);
});

test("only valid role values are accepted", () => {
  assert.equal(isAuthorizedAdminRole("SUPER_ADMIN"), true);
  assert.equal(isAuthorizedAdminRole("VIEWER"), true);
  assert.equal(isAuthorizedAdminRole("USER"), false);
  assert.equal(isAuthorizedAdminRole(""), false);
});
