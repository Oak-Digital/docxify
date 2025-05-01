/**
 * Should act the same way as when using `.slice()`
 */
export type Range = {
	/**
	 * inclusive
	 */
	start: number;
	/**
	 * exclusive
	 */
	end: number;
};

export const getArrayRanges = <T>(
	array: T[],
	predicate: (item: T) => boolean,
): Range[] => {
	const ranges: Range[] = [];
	let currentRange: Range | null = null;

	array.forEach((item, index) => {
		const passes = predicate(item);

		if (passes) {
			const newEnd = index + 1;
			currentRange ||= { start: index, end: newEnd };
			currentRange.end = newEnd;
			return;
		}

		if (currentRange) {
			ranges.push(currentRange);
			currentRange = null;
		}
	});

	if (currentRange) {
		ranges.push(currentRange);
	}

	return ranges;
};

/**
 * Returns a new array with the ranges replaced by the return value of
 */
export const replaceArrayRanges = <T>(
	array: T[],
	/**
	 * Ranges MUST NOT overlap
	 */
	ranges: Range[],
	replacer: (slice: T[]) => T[],
) => {
	const result: T[] = [];
	let lastIndex = 0;

	ranges.forEach((range) => {
		const { start, end } = range;
		result.push(...array.slice(lastIndex, start));
		result.push(...replacer(array.slice(start, end)));
		lastIndex = end;
	});

	result.push(...array.slice(lastIndex));

	return result;
};
