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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const debounce = (func: Function, delay: number) => {
	let timeoutId: number | undefined;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (...args: any[]) => {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(() => {
			func(...args);
		}, delay);
	};
};
