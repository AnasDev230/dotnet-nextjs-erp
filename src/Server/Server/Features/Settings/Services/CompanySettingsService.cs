using Server.Core.Common;
using Server.Features.Settings.Entities;
using Server.Features.Settings.Models;
using Server.Features.Settings.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.Settings.Services;

public class CompanySettingsService : ICompanySettingsService
{
    private readonly ICompanySettingsRepository _repository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CompanySettingsService(
        ICompanySettingsRepository repository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<CompanySettingsResponse> GetAsync()
    {
        var entity = await EnsureEntityExistsAsync();
        return MapToResponse(entity);
    }

    public async Task<CompanySettingsResponse> UpdateAsync(UpdateCompanySettingsRequest request)
    {
        var entity = await EnsureEntityExistsAsync();

        entity.CompanyName = (request.CompanyName ?? string.Empty).Trim();
        entity.CompanyNameEn = request.CompanyNameEn?.Trim();
        entity.TaxNumber = request.TaxNumber?.Trim();
        entity.Phone = request.Phone?.Trim();
        entity.Email = request.Email?.Trim();
        entity.Address = request.Address?.Trim();
        entity.City = request.City?.Trim();
        entity.Country = request.Country?.Trim();
        entity.Currency = (request.Currency ?? string.Empty).Trim().ToUpperInvariant();
        entity.UpdatedBy = _currentUserService.UserId;

        _repository.Update(entity);
        await _context.SaveChangesAsync();

        return MapToResponse(entity);
    }

    private async Task<CompanySettings> EnsureEntityExistsAsync()
    {
        var entity = await _repository.GetAsync();
        if (entity is not null)
            return entity;

        entity = new CompanySettings
        {
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddAsync(entity);
        await _context.SaveChangesAsync();

        return entity;
    }

    private static CompanySettingsResponse MapToResponse(CompanySettings entity)
        => new()
        {
            Id = entity.Id,
            CompanyName = entity.CompanyName,
            CompanyNameEn = entity.CompanyNameEn,
            TaxNumber = entity.TaxNumber,
            Phone = entity.Phone,
            Email = entity.Email,
            Address = entity.Address,
            City = entity.City,
            Country = entity.Country,
            LogoUrl = entity.LogoUrl,
            Currency = entity.Currency
        };
}