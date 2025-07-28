# ================================
# Stage 1: Build the application
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ../Domain/Domain.csproj ./Domain/
COPY ../Infrastructure/Infrastructure.csproj ./Infrastructure/
COPY ../API/API.csproj ./API/

# Restore dependencies
RUN dotnet restore ./API/API.csproj

# Copy toàn bộ source code
COPY ../ ./ 

# Build project
WORKDIR /src/API
RUN dotnet build API.csproj -c $BUILD_CONFIGURATION -o /app/build

# ================================
# Stage 2: Publish the application
# ================================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# ================================
# Stage 3: Build the runtime image
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

# Copy the publish output to the final image
COPY --from=publish /app/publish .

# Run the application
ENTRYPOINT ["dotnet", "API.dll"]
