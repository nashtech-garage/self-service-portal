import "@testing-library/jest-dom";
import { TextEncoder } from "util";

if (typeof globalThis.TextEncoder === "undefined") {
  // @ts-ignore
  globalThis.TextEncoder = TextEncoder;
}
