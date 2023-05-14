import Fastify from "fastify";
// import {} from ""

const fastify = Fastify({
	logger: true,
});

fastify.get("/", async (_request, _reply) => {
	return { hello: "world" };
});

fastify.post("/user", async (_request, _reply) => {
	return { hello: "world" };
});

async function start() {
	try {
		await fastify.listen({ port: 3000 });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

start();
