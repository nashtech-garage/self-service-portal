using System;
using System.Collections.Generic;
using System.Linq;
using System.IO.Hashing;
using System.Text;
using System.Threading.Tasks;
using Domain.Common.Constants;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Domain.Extensions
{
    public class StringExtension
    {
        /// <summary>
        /// HashString using CRC32 algorithm
        /// </summary>
        /// <param name="str"></param>
        /// <returns>uint hashValue</returns>
        public static uint HashStringCRC32(string str)
        {
            // Convert it into bytes array
            byte[] inputBytes = Encoding.UTF8.GetBytes(str);

            // Using Crc32 to hash recent array
            byte[] hashBytes = Crc32.Hash(inputBytes);

            // convert it into unit
            uint hashValue = BitConverter.ToUInt32(hashBytes, 0) % AuthConstant.MaxAllowUser;

            return hashValue;
        }

        /// <summary>
        /// Removes all diacritics (accents) from the input string, converting Vietnamese characters with accents to their unaccented form.
        /// Also handles the special Vietnamese characters 'đ' and 'Đ' by converting them to 'd' and 'D'.
        /// Useful for generating usernames, searching, or comparing strings without accents.
        /// </summary>
        /// <param name="text">The input string (may contain diacritics)</param>
        /// <returns>The string without diacritics</returns>
        public static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var normalized = text.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            return sb.ToString().Normalize(NormalizationForm.FormC)
                .Replace('đ', 'd')
                .Replace('Đ', 'D');
        }

        /// <summary>
        /// Normalizes whitespace in a string by trimming leading/trailing spaces and replacing multiple consecutive spaces with a single space.
        /// </summary>
        /// <param name="text">The input string that may contain excessive whitespace</param>
        /// <returns>The normalized string with consistent spacing</returns>
        public static string NormalizeWhitespace(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return text;
            }

            return Regex.Replace(text.Trim(), @"\s+", " ");
        }
    }
} 
