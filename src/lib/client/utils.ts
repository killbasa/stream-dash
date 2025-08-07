import { goto } from '$app/navigation';
import { page } from '$app/state';

export function getUnixTime(date: Date, time: string): number {
	const tmp = new Date(date);
	const split = time?.split(':');

	tmp.setHours(
		Number.parseInt(split[0]), //
		Number.parseInt(split[1]),
		0,
	);

	return tmp.getTime();
}

export const updateParams = async (key: string, value: string) => {
	const params = new URLSearchParams(page.url.searchParams);

	if (value) {
		params.set(key, value);
	} else {
		params.delete(key);
	}

	await goto(`?${params}`);
};
