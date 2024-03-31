import { Hono } from "hono";
import userRouter from "./routes/userRouter";
import blogRouter from "./routes/blogRouter";
import { IHono } from "./types";

const app = new Hono<IHono>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
