using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Common.Constants;
using Domain.Extensions;

namespace Test.Extensions
{
    public class StringExtensionTest
    {
        [Fact]
        public void HashStringCRC32_ReturnsConsistentHash_ForSameInput()
        {
            // Arrange
            string input = "test-string";

            // Act
            uint hash1 = StringExtension.HashStringCRC32(input);
            uint hash2 = StringExtension.HashStringCRC32(input);

            // Assert
            Assert.Equal(hash1, hash2);
        }

        [Fact]
        public void HashStringCRC32_ReturnsDifferentHash_ForDifferentInput()
        {
            // Arrange
            string input1 = "test-string-1";
            string input2 = "test-string-2";

            // Act
            uint hash1 = StringExtension.HashStringCRC32(input1);
            uint hash2 = StringExtension.HashStringCRC32(input2);

            // Assert
            Assert.NotEqual(hash1, hash2);
        }

        [Fact]
        public void HashStringCRC32_ResultIsLessThanMaxAllowUser()
        {
            // Arrange
            string input = "any-string";

            // Act
            uint hash = StringExtension.HashStringCRC32(input);

            // Assert
            Assert.InRange<uint>(hash, 0, (uint)(AuthConstant.MaxAllowUser - 1));
        }

        [Theory]
        [InlineData("Nguyễn", "Nguyen")]
        [InlineData("Đặng", "Dang")]
        [InlineData("Trần", "Tran")]
        [InlineData("đ", "d")]
        [InlineData("Đ", "D")]
        [InlineData("Lê Văn Đô", "Le Van Do")]
        [InlineData("Phạm", "Pham")]
        [InlineData("", "")]
        [InlineData(null, null)]
        public void RemoveDiacritics_RemovesVietnameseAccents(string input, string expected)
        {
            // Act
            var result = StringExtension.RemoveDiacritics(input);

            // Assert
            Assert.Equal(expected, result);
        }

        [Fact]
        public void RemoveDiacritics_ReturnsInput_WhenNoDiacritics()
        {
            // Arrange
            string input = "SimpleText";

            // Act
            var result = StringExtension.RemoveDiacritics(input);

            // Assert
            Assert.Equal("SimpleText", result);
        }

        [Theory]
        [InlineData("  Hello   World  ", "Hello World")]
        [InlineData("Test", "Test")]
        [InlineData("   Leading and trailing   ", "Leading and trailing")]
        [InlineData("Multiple     spaces   here", "Multiple spaces here")]
        [InlineData("", "")]
        [InlineData(null, null)]
        public void NormalizeWhitespace_TrimsAndNormalizesSpaces(string input, string expected)
        {
            // Act
            var result = StringExtension.NormalizeWhitespace(input);

            // Assert
            Assert.Equal(expected, result);
        }
    }
}