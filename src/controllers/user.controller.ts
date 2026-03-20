import { userModel } from "../models/user.model";

export const userController = {
    async getAll(req: Request) {
        try {
            const users = await userModel.getAll();
            return Response.json(users);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async getById(req: Request) {
        try {
            const url = new URL(req.url);
            const id = Number(url.pathname.split("/").pop());

            if (isNaN(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

            const user = await userModel.getById(id);
            if (!user) return Response.json({ error: "User not found" }, { status: 404 });

            return Response.json(user);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async create(req: Request) {
        try {
            const body = await req.json() as any;
            if (!body.name || !body.email) {
                return Response.json({ error: "Name and Email are required" }, { status: 400 });
            }

            const user = await userModel.create({
                name: body.name,
                email: body.email,
                active: body.active !== undefined ? !!body.active : true
            });

            return Response.json(user, { status: 201 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async update(req: Request) {
        try {
            const url = new URL(req.url);
            const id = Number(url.pathname.split("/").pop());

            if (isNaN(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

            const body = await req.json() as any;
            const user = await userModel.update(id, body);

            if (!user) return Response.json({ error: "User not found" }, { status: 404 });

            return Response.json(user);
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async delete(req: Request) {
        try {
            const url = new URL(req.url);
            const id = Number(url.pathname.split("/").pop());

            if (isNaN(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });

            await userModel.delete(id);
            return new Response(null, { status: 204 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    }
};
