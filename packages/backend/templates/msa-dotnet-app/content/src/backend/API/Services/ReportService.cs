using API.Exceptions;
using API.Services.Abstracts;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Domain.Common;
using Domain.Common.Constants;
using Domain.Dtos.Requests;
using Domain.Dtos.Responses;
using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class ReportService : IReportService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IAssetRepository _assetRepository;
    private readonly ICurrentUserContext _currentUserContext;
    private readonly IUserRepository _userRepository;
    private readonly IStateRepository _stateRepository;

    public ReportService(
        ICategoryRepository categoryRepository,
        IAssetRepository assetRepository,
        ICurrentUserContext currentUserContext,
        IStateRepository stateRepository,
        IUserRepository userRepository)
    {
        _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        _assetRepository = assetRepository ?? throw new ArgumentNullException(nameof(assetRepository));
        _currentUserContext = currentUserContext ?? throw new ArgumentNullException(nameof(currentUserContext));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _stateRepository = stateRepository ?? throw new ArgumentException(nameof(stateRepository));
    }

    public async Task<byte[]> GetExportAsync()
    {
        var data = await GetAllReport();
        using var memoryStream = new MemoryStream();
        using (SpreadsheetDocument spreadsheetDocument = SpreadsheetDocument.Create(memoryStream, SpreadsheetDocumentType.Workbook, true))
        {
            WorkbookPart workbookPart = spreadsheetDocument.AddWorkbookPart();
            workbookPart.Workbook = new Workbook();

            WorksheetPart worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
            SheetData sheetData = new SheetData();
            worksheetPart.Worksheet = new Worksheet(sheetData);

            Sheets sheets = spreadsheetDocument.WorkbookPart.Workbook.AppendChild(new Sheets());
            Sheet sheet = new Sheet()
            {
                Id = spreadsheetDocument.WorkbookPart.GetIdOfPart(worksheetPart),
                SheetId = 1,
                Name = "Documents"
            };
            sheets.Append(sheet);

            Row headerRow = new Row();
            headerRow.Append(CreateCell("Category"));
            headerRow.Append(CreateCell("Total"));

            var stateOrder = data.States;
            foreach (var state in stateOrder)
            {
                headerRow.Append(CreateCell(state.Name));
            }
            sheetData.Append(headerRow);

            foreach (var category in data.Categories)
            {
                var row = new Row();
                row.Append(CreateCell(category.Name));
                row.Append(CreateCell(category.Total.ToString()));

                foreach (var state in stateOrder)
                {
                    var matched = category.States.FirstOrDefault(s => s.Id == state.Id);
                    var quantity = matched?.Quantity ?? 0;
                    row.Append(CreateCell(quantity.ToString()));
                }
                sheetData.Append(row);
            }
        }
        return memoryStream.ToArray();
    }

    public async Task<(List<StateDto> States, List<CategoryWithStateDto> Categories)> GetAllReport()
    {
        var admin = await _userRepository.Queryable.WithoutDeleted().FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

        if (admin == null)
        {
            throw new NotFoundException("Current admin user not found");
        }

        var states = await _stateRepository.Queryable
            .WithoutDeleted()
            .Where(s => s.TypeEntity == "Asset" && s.Action == "View")
            .Select(c => new StateDto { Id = c.Id, Name = c.Name })
            .ToListAsync();

        var assetGroups = await _assetRepository.Queryable
            .WithoutDeleted()
            .Where(a => a.LocationId == admin.LocationId)
            .GroupBy(a => new { a.CategoryId, a.State })
            .Select(g => new
            {
                g.Key.CategoryId,
                g.Key.State,
                Quantity = g.Count()
            })
            .ToListAsync();

        var categories = await _categoryRepository.Queryable
            .WithoutDeleted()
            .OrderBy(c => c.Name)
            .ToListAsync();

        var result = categories.Select(category =>
        {
            var categoryAssets = assetGroups
                .Where(g => g.CategoryId == category.Id)
                .ToList();

            return new CategoryWithStateDto
            {
                Id = category.Id,
                Name = category.Name,
                Total = categoryAssets.Sum(x => x.Quantity),
                States = categoryAssets.Select(x => new CategoryStateQuantityDto
                {
                    Id = (int)x.State,
                    Quantity = x.Quantity
                }).ToList()
            };
        }).ToList();

        return (states, result);
    }

    public async Task<PaginationData<BasicReportResponse>> GetReportAsync(GetListCategoryReportRequest request)
    {
        var admin = await _userRepository.Queryable.WithoutDeleted().FirstOrDefaultAsync(u => u.Id == _currentUserContext.UserId);

        if (admin == null)
        {
            throw new NotFoundException("Current admin user not found");
        }

        var states = await _stateRepository.Queryable
            .WithoutDeleted()
            .Where(s => s.TypeEntity.ToLower() == nameof(Asset).ToLower() && s.Action == "View")
            .OrderBy(s => s.Name)
            .Select(c => new StateDto { Id = c.Id, Name = c.Name })
            .ToListAsync();

        var stateIdSort = states.Select(s => s.Id.ToString()).ToList();

        var queryCategory = _categoryRepository
            .Queryable
            .WithoutDeleted()
            .AsNoTracking();

        var total = await queryCategory.CountAsync();

        var isSortName = false;

        var sortByLower = request.SortBy.ToLower();

        if (sortByLower == nameof(Category.Name).ToLower())
        {
            isSortName = true;
            queryCategory = queryCategory
                .ApplySorting(request.SortBy, request.Direction)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize);
        }
        else if (!stateIdSort.Contains(request.SortBy) && sortByLower != nameof(CategoryWithStateDto.Total).ToLower())
        {
            throw new BadRequestException($"Not found field sort with Field={request.SortBy}");
        }

        // if isSortState = false, we get all category 
        var allCategory = await queryCategory
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();

        var allCategoryId = allCategory.Select(a => a.Id).ToList();

        var rawGroupedData = await _assetRepository.Queryable
            .WithoutDeleted()
            .Where(a => allCategoryId.Contains(a.CategoryId) && a.LocationId == admin.LocationId)
            .GroupBy(a => a.Category)
            .Select(g => new CategoryWithStateDto
            {
                Id = g.Key.Id,
                Name = g.Key.Name,
                Total = g.Count(),
                States = g
                    .GroupBy(x => x.State)
                    .Select(k => new CategoryStateQuantityDto
                    {
                        Id = (int)k.Key,
                        Quantity = k.Count()
                    })
                    .ToList()
            })
            .ToListAsync();

        var assets = allCategory.Select(cat =>
            {
                var matched = rawGroupedData.FirstOrDefault(c => c.Id == cat.Id);

                return new CategoryWithStateDto
                {
                    Id = cat.Id,
                    Name = cat.Name,
                    Total = matched?.Total ?? 0,
                    States = stateIdSort.Select(stateId =>
                    {
                        var quantity = matched?.States.FirstOrDefault(s => s.Id.ToString() == stateId)?.Quantity ?? 0;
                        return new CategoryStateQuantityDto
                        {
                            Id = int.Parse(stateId),
                            Quantity = quantity
                        };
                    }).ToList()
                };
            }).ToList();

        var categoriesFlatListQuery = assets.Select(c =>
        {
            var dict = new Dictionary<string, object>
            {
                ["id"] = c.Id,
                ["name"] = c.Name,
                ["total"] = c.Total
            };

            foreach (var state in c.States)
            {
                dict[state.Id.ToString()] = state.Quantity;
            }

            return dict;
        });

        var data = new List<BasicReportResponse>();

        categoriesFlatListQuery = request.Direction.ToLower() == PaginationConstants.ASCENDING.ToLower()
            ? categoriesFlatListQuery.OrderBy(d => d[sortByLower].ToString()).ToList()
            : categoriesFlatListQuery.OrderByDescending(d => d[sortByLower].ToString()).ToList();

        if (!isSortName)
        {
            var categoriesFlatList = categoriesFlatListQuery.Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

            data.Add(new BasicReportResponse
            {
                States = states,
                Categories = categoriesFlatList
            });
        }
        else
        {
            var categoriesFlatList =
                categoriesFlatListQuery.ToList();

            data.Add(new BasicReportResponse
            {
                States = states,
                Categories = categoriesFlatList
            });
        }

        return new PaginationData<BasicReportResponse>(data, request.PageSize, request.Page, total);
    }

    private static Cell CreateCell(string text)
    {
        return new Cell
        {
            DataType = CellValues.String,
            CellValue = new CellValue(text)
        };
    }
}
