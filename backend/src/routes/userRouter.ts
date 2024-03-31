import { Hono } from "hono";
import { sign } from "hono/jwt";
import prismaClient from "../client";
import { IHono } from "../types";

const userRouter = new Hono<IHono>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const client = prismaClient(c);

  try {
    const user = await client.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    });

    const authToken = await sign(
      {
        id: user.id,
      },
      c.env.JWT_SECRET
    );
    return c.text(authToken);
  } catch (err) {
    c.status(411);
    console.log("🚀 ~ app.post ~ err:", err);
    return c.text("Invalid");
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const client = prismaClient(c);

  try {
    const user = await client.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      c.status(403);
      return c.json({ error: "user not found" });
    }

    const jwt = await sign({ userId: user.id }, c.env.JWT_SECRET);
    return c.json({ authToken: jwt });
  } catch (err) {
    c.status(411);
    console.log("🚀 ~ app.post ~ err:", err);
    return c.text("Invalid");
  }
});

export default userRouter;
