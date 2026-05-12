import { z } from "zod";
const schema = z.string();
const res = schema.safeParse(123);
if (!res.success) {
  console.log(res.error.issues);
}
