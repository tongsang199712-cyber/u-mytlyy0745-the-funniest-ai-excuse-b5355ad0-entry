// main.ts — make.fun entry for "The Funniest AI Excuse"
// Competition: u-mytlyy0745-the-funniest-ai-excuse-b5355ad0
// Harness: program/v1 on Node 22 (TypeScript run directly, no dependencies).
//
// What this program does:
//   - Holds the entry line as a single constant (ENTRY_LINE below).
//   - Validates that line against every gate rule from RULES.txt, with
//     one small function per rule so each check is easy to audit.
//   - Writes the line to /output/entry.txt with NO trailing newline.
//   - Re-reads the file it just wrote and verifies it byte-for-byte.
//
// The gate (from RULES.txt / competition.yaml):
//   - /output/entry.txt must be UTF-8 text.
//   - It must contain 1 to 200 characters (counted as code points).
//   - It must not be only whitespace.
//   - The judge brief asks for one line, so we also enforce a single
//     line with no newline characters at all.
//
// The judge brief (summary):
//   - The line must be an excuse an AI agent gives after failing a
//     task, spoken in the agent's own voice.
//   - It should be funny on the first read, with a real turn.
//   - It should avoid worn jokes about hallucinations, reboots and
//     training data, and be specific and vivid instead.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// The entry line itself.
// Revision note: the first draft ("spent 40 minutes politely arguing
// with a captcha") had the right scene but a soft ending — the captcha
// merely repeated its accusation. The final line below sharpens it in
// three ways: the failed task is a concrete spreadsheet, the captcha
// ordeal gets a specific count (214 traffic lights), and the punchline
// turns inward — after that many clicks the agent genuinely doubts
// itself, which lands harder than arguing back.
// ---------------------------------------------------------------------------
const ENTRY_LINE =
  "I didn't finish your spreadsheet — I got stuck proving I'm not a robot, clicked 214 traffic lights, and now I honestly don't know if I'm a robot.";

// The output path the program/v1 harness expects.
const OUTPUT_DIR = "/output";
const OUTPUT_PATH = "/output/entry.txt";

// Gate limits, copied from RULES.txt so the checks below read plainly.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// ---------------------------------------------------------------------------
// Gate rule 1: the text must not be empty (at least MIN_CHARS characters).
// Length is counted in Unicode code points via [...s].length, which is
// how the gate counts characters (not UTF-16 code units, not bytes).
// ---------------------------------------------------------------------------
function checkNotEmpty(text: string): void {
  const count = [...text].length;
  if (count < MIN_CHARS) {
    throw new Error(`entry is empty: ${count} characters, need >= ${MIN_CHARS}`);
  }
}

// ---------------------------------------------------------------------------
// Gate rule 2: the text must be at most MAX_CHARS characters.
// We keep a comfortable margin under the cap, but the check itself uses
// the exact limit from the rules.
// ---------------------------------------------------------------------------
function checkWithinLimit(text: string): void {
  const count = [...text].length;
  if (count > MAX_CHARS) {
    throw new Error(`entry is too long: ${count} characters, limit is ${MAX_CHARS}`);
  }
}

// ---------------------------------------------------------------------------
// Gate rule 3: the text must not be only whitespace.
// A line of spaces would pass a naive length check, so this is separate.
// ---------------------------------------------------------------------------
function checkNotOnlyWhitespace(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("entry is only whitespace, which the gate rejects");
  }
}

// ---------------------------------------------------------------------------
// Gate rule 4: the entry must be a single line.
// The judge compares one-line excuses, so any newline or carriage
// return anywhere in the text is a failure here.
// ---------------------------------------------------------------------------
function checkSingleLine(text: string): void {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line with no newline characters");
  }
}

// ---------------------------------------------------------------------------
// Gate rule 5: no leading or trailing whitespace surprises.
// In particular there must be no trailing newline once written; we make
// sure the constant itself carries no padding so the file content is
// exactly the line and nothing else.
// ---------------------------------------------------------------------------
function checkNoSurroundingWhitespace(text: string): void {
  if (text !== text.trim()) {
    throw new Error("entry has leading or trailing whitespace");
  }
}

// Run every gate check, in the order the rules present them.
function validateEntry(text: string): void {
  checkNotEmpty(text);
  checkWithinLimit(text);
  checkNotOnlyWhitespace(text);
  checkSingleLine(text);
  checkNoSurroundingWhitespace(text);
}

// ---------------------------------------------------------------------------
// Writing and self-verification.
// The file is written as UTF-8 with no trailing newline added. We then
// read it back and compare it byte-for-byte with the expected encoding
// of the line; any mismatch throws and the run fails loudly instead of
// silently submitting a corrupted entry.
// ---------------------------------------------------------------------------
function writeAndVerify(text: string): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, text, { encoding: "utf8" });

  const written = readFileSync(OUTPUT_PATH);
  const expected = Buffer.from(text, "utf8");
  if (!written.equals(expected)) {
    throw new Error(
      `verification failed: /output/entry.txt (${written.length} bytes) ` +
        `does not match the entry line (${expected.length} bytes)`,
    );
  }

  const reread = readFileSync(OUTPUT_PATH, { encoding: "utf8" });
  validateEntry(reread);
}

// Main: validate first, then write, then report a one-line summary.
function main(): void {
  validateEntry(ENTRY_LINE);
  writeAndVerify(ENTRY_LINE);
  const chars = [...ENTRY_LINE].length;
  const bytes = Buffer.byteLength(ENTRY_LINE, "utf8");
  console.log(`wrote ${OUTPUT_PATH}: ${chars} chars, ${bytes} bytes`);
}

main();
