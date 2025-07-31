using Domain.Dtos.Responses;

namespace API.Services.Abstracts
{
    public interface ISampleService
    {
        Task<SampleResponse?> SampleGetAsync();
        Task SyncRedisAsync();
    }
}