Bun.serve({
  port: 8000,
  routes: {
    '/questions': async (req) => {
      const body = await req.json();

      return Response.json({
        answers: `Echoed ${body.questions}`,
      });
    },
  },
});
