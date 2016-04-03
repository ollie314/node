'use strict';
// Flags: --expose-gc

const common = require('../common');
const assert = require('assert');

const skipMessage =
  '1..0 # Skipped: intensive toString tests due to memory confinements';
if (!common.enoughTestMem) {
  console.log(skipMessage);
  return;
}
assert(typeof gc === 'function', 'Run this test with --expose-gc');

// v8 fails silently if string length > v8::String::kMaxLength
// v8::String::kMaxLength defined in v8.h
const kStringMaxLength = process.binding('buffer').kStringMaxLength;

try {
  var buf = Buffer.allocUnsafe(kStringMaxLength + 1);
  // Try to allocate memory first then force gc so future allocations succeed.
  Buffer.allocUnsafe(2 * kStringMaxLength);
  gc();
} catch (e) {
  // If the exception is not due to memory confinement then rethrow it.
  if (e.message !== 'Array buffer allocation failed') throw (e);
  console.log(skipMessage);
  return;
}

assert.throws(function() {
  buf.toString('binary');
}, /"toString\(\)" failed/);

var maxString = buf.toString('binary', 1);
assert.equal(maxString.length, kStringMaxLength);
// Free the memory early instead of at the end of the next assignment
maxString = undefined;

maxString = buf.toString('binary', 0, kStringMaxLength);
assert.equal(maxString.length, kStringMaxLength);
