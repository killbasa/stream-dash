export const ok = (status = 200) => {
	return new Response(undefined, { status });
};
