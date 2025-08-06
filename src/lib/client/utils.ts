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
