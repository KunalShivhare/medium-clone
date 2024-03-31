import { Hono } from "hono";
import { sign, decode, verify } from "hono/jwt";
import prismaClient from "../client";
import { IHono } from "../types";

const blogRouter = new Hono<IHono>();

blogRouter.use("/*", async (c, next) => {
  try {
    const authToken = c.req.header("Authorization") || "";
    const userDetails = await verify(authToken, c.env.JWT_SECRET);
    if (userDetails) {
      c.set("userId", userDetails.userId);
      await next();
    } else {
      c.status(403);
      return c.text("Invalid Auth");
    }
  } catch (err) {
    c.status(403);
    return c.text("User not loggedIn");
  }
});

blogRouter.post("/create", async (c) => {
  const body = await c.req.json();
  const userId = c.get("userId");
  const client = prismaClient(c);

  try {
    const blog = await client.blog.create({
      data: {
        title: body.title,
        content: body.content,
        userId: userId,
      },
    });

    c.text("Blog created successfully");
    return c.json({
      id: blog.id,
    });
  } catch (err) {
    c.status(403);
    return c.text("Invalid");
  }
});

blogRouter.put("/update", async (c) => {
  const body = await c.req.json();
  const client = prismaClient(c);

  try {
    const blog = await client.blog.update({
      where: {
        id: body.blogId,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    c.text("Blog updated successfully");
    return c.json({
      title: blog.title,
      content: blog.content,
    });
  } catch (err) {
    c.status(403);
    return c.text("Invalid");
  }
});
blogRouter.get("/view", async (c) => {
  const body = await c.req.json();
  const client = prismaClient(c);

  try {
    const blog = await client.blog.findFirst({
      where: {
        id: body.blogId,
      },
    });
    return c.json({
      blog: blog,
    });
  } catch (err) {
    c.status(403);
    return c.text("Invalid");
  }
});
blogRouter.get("/all", async (c) => {
  const body = await c.req.json();
  const client = prismaClient(c);

  try {
    const blogs = await client.blog.findMany({
      where: {
        userId: body.userId,
      },
    });

    return c.json({
      blogs: blogs,
    });
  } catch (err) {
    c.status(403);
    return c.text("Invalid");
  }
});
export default blogRouter;
