using Domain.Dtos.Requests;
using Domain.Dtos.Responses;

namespace API.Services.Abstracts
{
    public interface IAssetService
    {
        Task<PaginationData<ListBasicAssetResponse>> GetAssetsAsync(GetListAssetRequest request);
        Task<GetAssetDetailsResponse> GetAssetDetailsAsync(int assetId);
        Task<CreateEditAssetResponse> CreateAssetAsync(CreateAssetRequest request);
        Task<CreateEditAssetResponse> UpdateAssetAsync(int assetId, UpdateAssetRequest request);
        Task DeleteAssetAsync(int assetId);
    }
}
