export async function load({ url }) {
	const period = url.searchParams.get('period');
	return { period };
}
