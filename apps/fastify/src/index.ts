import Fastify from "fastify";
import { User, createUser } from "hoge-domain";

const fastify = Fastify({
	logger: true,
});

fastify.get("/", async (_request, _reply) => {
	return { hello: "world" };
});

fastify.post<{ Body: { name: User["name"] } }>(
	"/user",
	async (request, _reply) => {
		console.log("request", request.body);

		const name = request.body.name;
		const user = createUser({ name });

		return user;
	}
);

async function start() {
	try {
		await fastify.listen({ port: 3000 });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
