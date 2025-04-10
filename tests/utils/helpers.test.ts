import { formatTimer } from "../../utils/helpers";

const s = (n: number) => 1000 * n;
const m = (n: number) => s(60) * n;
const hr = (n: number) => m(60) * n;

test("timer prints out properly formatted times", () => {
  expect(formatTimer(999)).toBe("0");
  expect(formatTimer(s(0))).toBe("0");
  expect(formatTimer(s(1))).toBe("01");
  expect(formatTimer(s(2))).toBe("02");
  expect(formatTimer(s(20))).toBe("20");
  expect(formatTimer(m(1))).toBe("1:00");
  expect(formatTimer(m(2))).toBe("2:00");
  expect(formatTimer(m(10))).toBe("10:00");
  expect(formatTimer(m(10) + s(10))).toBe("10:10");
  expect(formatTimer(m(10) + s(9))).toBe("10:09");
  expect(formatTimer(hr(1))).toBe("1:00:00");
  expect(formatTimer(hr(2))).toBe("2:00:00");
  expect(formatTimer(hr(10))).toBe("10:00:00");
  expect(formatTimer(hr(1) + m(20))).toBe("1:20:00");
  expect(formatTimer(hr(1) + m(9))).toBe("1:09:00");
  expect(formatTimer(hr(1) + m(9) + s(10))).toBe("1:09:10");
  expect(formatTimer(hr(1) + m(9) + s(9))).toBe("1:09:09");
  expect(formatTimer(hr(1) + s(10))).toBe("1:00:10");
  expect(formatTimer(hr(1) + s(9))).toBe("1:00:09");
});
