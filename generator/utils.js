/**
 * Hashes a string using the DJB2 algorithm with a slight modification
 * to use a multiply-then-XOR pattern (hash = (hash * 33) ^ B).
 * This implementation aims to replicate the C# behavior using 32-bit
 * signed integer arithmetic via JavaScript's bitwise operations.
 *
 * @param {string} strToHash The string to hash.
 * @param {boolean} [lowercase=false] Whether to convert the string to lowercase before hashing.
 * @returns {number} The 32-bit signed integer hash value.
 */
export function fnvHash(strToHash, lowercase = false) {
  if (lowercase) {
    strToHash = strToHash.toLowerCase();
  }

  // Initialize hash value, 5381 is the common seed for DJB2
  let hash = 5381;

  for (let i = 0; i < strToHash.length; i++) {
    // Get the character code (effectively the byte B for ASCII/Latin-1)
    // charCodeAt returns a 16-bit number. The bitwise operations
    // ensure 32-bit signed integer arithmetic is used.
    let B = strToHash.charCodeAt(i);

    // The core hashing logic: hash = (hash * 33) ^ B
    // The bitwise OR | 0 is a common JavaScript idiom to ensure
    // the result of the multiplication is treated as a 32-bit signed integer
    // before the XOR operation.
    hash = ((hash * 33) | 0) ^ B;
  }

  // The result is already a 32-bit signed integer due to the bitwise operations.
  return hash;
}
