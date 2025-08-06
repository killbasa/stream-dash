import { getUnixTime } from './utils';

describe('utils', () => {
	it('should return same time', () => {
		const result = getUnixTime(new Date('2023-01-01'), '12:00');

		expect(new Date(result)).toStrictEqual(new Date(1672506000000));
	});
});
