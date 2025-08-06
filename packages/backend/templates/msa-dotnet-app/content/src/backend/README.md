## Project Asset Management
### How to start project `backend`
#### 1.Copy file `.env` from `.env.example` <br/>
You must stay in `backend` folder
```sh
cp .env.example .env # Macos/Linux
copy .env.example .env # window
```
#### 2. Start Docker 🐳
You must stay in `backend` folder
```sh
docker-compose up -d
```
### Port and database docker
|  No  | Name | Port | Type |
|--- |--- |--- |--- |
| 1   | api | 8123 | .NET API |
| 3   | database | 5432 | Postgres |
| 4   | redis | 6379 | Redis |

### How to create new Migration
You must stay in `backend` folder
```sh
dotnet ef migrations add InitialDatabase --project Infrastructure --startup-project Api --output-dir Migrations
```

### How to update database
You must stay in `backend` folder
```sh
dotnet ef database update --project Infrastructure --startup-project Api
```

### How to remove migration
You must stay in `backend` folder
```sh
dotnet ef migrations remove --project Infrastructure --startup-project Api
```

```sh
dotnet test Test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:Exclude="[Domain*]*%2c[Infrastructure*]*"
```

```sh
reportgenerator -reports:"Test/coverage.cobertura.xml" -targetdir:"Test/coverage-report" -reporttypes:Html
```