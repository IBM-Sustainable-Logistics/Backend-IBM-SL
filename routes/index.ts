import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const router = new Router();

router.get("/", (context) => {
  context.response.body = "Welcome to IBM-SL Api";
});

router.get("/api", (context) => {
  context.response.body = "Her the IBM SL api will live";
});

// Add more routes here

export default router;