import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Welcome to IBM-SL Api";
  })
  .get("/api", (context) => {
    console.log("coming soon")
  })
  .get("/api/", (context) => {
    console.log("coming soon")
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });