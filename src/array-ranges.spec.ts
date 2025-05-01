import { describe, it, expect } from "bun:test";
import { getArrayRanges, replaceArrayRanges, type Range } from "./array-ranges";

describe("Array Ranges", () => {
	describe("getArrayRanges", () => {
		it("should return a single range if all items pass the predicate", () => {
			const input = [1, 2, 3, 4, 5];
			const predicate = () => true;
			const result = getArrayRanges(input, predicate);

			expect(result).toEqual([{ start: 0, end: 5 }]);
		});

		it("should not return any ranges if no items pass the predicate", () => {
			const input = [1, 2, 3, 4, 5];
			const predicate = () => false;
			const result = getArrayRanges(input, predicate);

			expect(result).toEqual([]);
		});

		it("should return two ranges if there is a gap between the items that pass the predicate", () => {
			const input = [true, false, true];
			const result = getArrayRanges(input, (item) => item);

			expect(result).toEqual([
				{ start: 0, end: 1 },
				{ start: 2, end: 3 },
			]);
		});

		it("should return multiple ranges if there are multiple gaps", () => {
			const input = [true, false, true, false, true];
			const result = getArrayRanges(input, (item) => item);

			expect(result).toEqual([
				{ start: 0, end: 1 },
				{ start: 2, end: 3 },
				{ start: 4, end: 5 },
			]);
		});

		describe("Edge Cases", () => {
			it("should handle empty arrays", () => {
				const input: boolean[] = [];
				const result = getArrayRanges(input, (item) => item);

				expect(result).toEqual([]);
			});

			it("should handle arrays with a single item", () => {
				const input = [true];
				const result = getArrayRanges(input, (item) => item);

				expect(result).toEqual([{ start: 0, end: 1 }]);
			});
		});
	});

	describe("replaceArrayRanges", () => {
		it("should return the original array if no ranges are provided", () => {
			const input = [1, 2, 3, 4, 5];
			const ranges: Range[] = [];
			const result = replaceArrayRanges(input, ranges, (slice) => slice);

			expect(result).toEqual(input);
		});

		it("should replace the entire array if a single range covers it", () => {
			const input = [1, 2, 3, 4, 5];
			const ranges: Range[] = [{ start: 0, end: 5 }];
			const result = replaceArrayRanges(input, ranges, (slice) => [10]);

			expect(result).toEqual([10]);
		});

		it("should only replace the specified ranges", () => {
			const input = [1, 2, 3, 4, 5];
			const ranges: Range[] = [{ start: 1, end: 3 }];
			const result = replaceArrayRanges(input, ranges, (slice) =>
				slice.map((x) => x * 2),
			);

			expect(result).toEqual([1, 4, 6, 4, 5]);
		});

		it("should handle multiple ranges", () => {
			const input = [1, 2, 3, 4, 5];
			const ranges: Range[] = [
				{ start: 1, end: 3 },
				{ start: 4, end: 5 },
			];
			const result = replaceArrayRanges(input, ranges, (slice) =>
				slice.map((x) => x * 2),
			);

			expect(result).toEqual([1, 4, 6, 4, 10]);
		});
	});
});
