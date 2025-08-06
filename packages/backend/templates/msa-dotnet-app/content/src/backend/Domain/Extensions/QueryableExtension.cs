using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using Domain.Common.Constants;
using Domain.Entities;

namespace Domain.Common
{
    public static class QueryableExtension
    {
        public static IQueryable<T> WithoutDeleted<T>(this IQueryable<T> source) where T : BaseEntity
        {
            return source.Where(e => !e.IsDeleted);
        }

        public static IQueryable<User> WithoutDisabledUser(this IQueryable<User> source)
        {
            return source.Where(e => !e.IsDisable);
        }

        public static IQueryable<T> WithDeleted<T>(this IQueryable<T> source) where T : BaseEntity
        {
            return source.Where(e => e.IsDeleted);
        }

        public static IQueryable<T> ApplySorting<T>(this IQueryable<T> source, string sortBy, string direction) where T : class
        {
            if (string.IsNullOrWhiteSpace(sortBy))
                return source;

            var parameter = Expression.Parameter(typeof(T), "x");

            Expression propertyAccess = parameter;
            Type currentType = typeof(T);

            foreach (var propName in sortBy.Split('.'))
            {
                var property = currentType.GetProperty(propName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                if (property == null)
                    throw new ArgumentException($"Property '{propName}' not found on type '{currentType.Name}'");

                propertyAccess = Expression.Property(propertyAccess, property);
                currentType = property.PropertyType;
            }

            // Handle nullable enums
            var underlyingType = Nullable.GetUnderlyingType(currentType) ?? currentType;
            bool isEnum = underlyingType.IsEnum;

            LambdaExpression lambda;
            Type keyType;

            if (isEnum)
            {
                // Convert to string using ToString()
                var toStringCall = Expression.Call(propertyAccess, typeof(object).GetMethod("ToString", Type.EmptyTypes));
                lambda = Expression.Lambda(toStringCall, parameter);
                keyType = typeof(string);
            }
            else
            {
                lambda = Expression.Lambda(propertyAccess, parameter);
                keyType = currentType;
            }

            var methodName = direction?.Trim().Equals(PaginationConstants.DESCENDING, StringComparison.OrdinalIgnoreCase) == true
                            ? "OrderByDescending"
                            : "OrderBy";

            var resultExp = Expression.Call(
                typeof(Queryable),
                methodName,
                new Type[] { typeof(T), keyType },
                source.Expression,
                Expression.Quote(lambda));

            var orderedQuery = (IOrderedQueryable<T>)source.Provider.CreateQuery<T>(resultExp);

            // Always apply ThenByDescending(x => x.Id)
            var idProperty = typeof(T).GetProperty("Id", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (idProperty != null)
            {
                var idAccess = Expression.Property(parameter, idProperty);
                var idLambda = Expression.Lambda(idAccess, parameter);

                var thenByExp = Expression.Call(
                    typeof(Queryable),
                    "ThenByDescending",
                    new Type[] { typeof(T), idProperty.PropertyType },
                    orderedQuery.Expression,
                    Expression.Quote(idLambda));

                return orderedQuery.Provider.CreateQuery<T>(thenByExp);
            }

            return orderedQuery;
        }
    }
}