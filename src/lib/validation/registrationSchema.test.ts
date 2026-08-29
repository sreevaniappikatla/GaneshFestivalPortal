import test from "node:test";
import assert from "node:assert/strict";

import { createRegistrationSchema } from "./registrationSchema.ts";

test("registration schema allows an empty email when the user leaves it blank", () => {
  const schema = createRegistrationSchema("2026-09-01", "2026-09-10");

  const result = schema.safeParse({
    residentName: "Priya Sharma",
    unitNumber: "B-204",
    phone: "9876543210",
    email: "",
    poojaId: "11111111-1111-4111-8111-111111111111",
    poojaSlotId: "22222222-2222-4222-8222-222222222222",
    poojaDate: "2026-09-04",
    familyMembersCount: 2,
    gotram: "",
    familyNames: "",
    notes: "",
  });

  assert.equal(result.success, true, result.success ? "" : JSON.stringify(result.error?.issues ?? []));
});
