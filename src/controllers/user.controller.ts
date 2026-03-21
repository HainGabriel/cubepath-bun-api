import { userModel, type User } from "../models/user.model";

export const userController = {
    async getAll(req: Request) {
        try {
            const users = await userModel.getAll();
            return Response.json(users);
        } catch (error) {
            console.error("User Controller Error (getAll):", (error as Error).message);
            return Response.json({ 
                error: (error as Error).message,
                details: "Check database connection or schema." 
            }, { status: 500 });
        }
    },

    async getById(req: Request) {
        try {
            const url = new URL(req.url);
            const pathParts = url.pathname.split("/");
            const id = Number(pathParts[pathParts.length - 1]);

            if (isNaN(id)) {
                return Response.json({ error: "Invalid ID: Must be a number" }, { status: 400 });
            }

            const user = await userModel.getById(id);
            if (!user) return Response.json({ error: "User not found" }, { status: 404 });

            return Response.json(user);
        } catch (error) {
            console.error("User Controller Error (getById):", (error as Error).message);
            return Response.json({ error: (error as Error).message }, { status: 500 });
        }
    },

    async create(req: Request) {
        try {
            const json = await req.json() as Partial<User>;
            if (!json.name || !json.email) {
                return Response.json({ error: "Name and email are required" }, { status: 400 });
            }

            const newUser = await userModel.create({
                name: json.name,
                email: json.email,
                active: json.active ?? true
            });

            return Response.json(newUser, { status: 201 });
        } catch (error) {
            console.error("User Controller Error (create):", (error as Error).message);
            return Response.json({ 
                error: (error as Error).message,
                hint: "Ensure the email is unique and DB is connected."
            }, { status: 500 });
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
