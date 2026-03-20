import { todoModel } from "../models/todo.model";

export const todoController = {
    async getAll(req: Request) {
        try {
            const todos = await todoModel.getAll();
            return Response.json(todos);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async getById(req: Request) {
        try {
            const url = new URL(req.url);
            const idStr = url.pathname.split("/").pop();
            const id = Number(idStr);

            if (isNaN(id)) {
                return Response.json({ error: "Invalid ID" }, { status: 400 });
            }

            const todo = await todoModel.getById(id);
            if (!todo) {
                return Response.json({ error: "Todo not found" }, { status: 404 });
            }

            return Response.json(todo);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async create(req: Request) {
        try {
            const body = await req.json() as any;
            if (!body.title) {
                return Response.json({ error: "Title is required" }, { status: 400 });
            }

            const todo = await todoModel.create({
                title: body.title,
                completed: !!body.completed
            });

            return Response.json(todo, { status: 201 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async update(req: Request) {
        try {
            const url = new URL(req.url);
            const idStr = url.pathname.split("/").pop();
            const id = Number(idStr);

            if (isNaN(id)) {
                return Response.json({ error: "Invalid ID" }, { status: 400 });
            }

            const body = await req.json() as any;
            const todo = await todoModel.update(id, body);

            if (!todo) {
                return Response.json({ error: "Todo not found" }, { status: 404 });
            }

            return Response.json(todo);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async delete(req: Request) {
        try {
            const url = new URL(req.url);
            const idStr = url.pathname.split("/").pop();
            const id = Number(idStr);

            if (isNaN(id)) {
                return Response.json({ error: "Invalid ID" }, { status: 400 });
            }

            const success = await todoModel.delete(id);
            if (!success) {
                return Response.json({ error: "Todo not found" }, { status: 404 });
            }

            return new Response(null, { status: 204 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    }
};
