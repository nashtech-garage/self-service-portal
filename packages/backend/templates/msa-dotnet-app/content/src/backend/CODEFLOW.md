# Code flow for backend
## Coding convention
### Setting for vscode
Format code before commit and push 😁
```json
{
    "[csharp]": {
        "editor.maxTokenizationLineLength": 2500,
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.removeUnusedImports": "explicit"
        },
    },
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
            "source.removeUnusedImports": "explicit"
        },
}
```
## Coding Style 👉 [Microsoft Document]("https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/identifier-names")

## How to create a new API 👾
### Controller
👉 Controller must inherit from `ApiController`
```C#
public class SampleController : APIController<SampleController> // ---> See at SampleController.cs
```
👉 Default Method of a controller will be main action of this controller
```C#
api/user-management // Main route
[GET] api/user-management // Get list
[GET] api/user-management/{id} // Get detail user
[POST] api/user-management // Create user with body
[PUT] api/user-management // Update user
[DELETE] api/user-management/{id} // Delete user
[POST] api/user-management // Delete many users with body
// Or
[DELETE] api/user-management?id=1,2,3,... // not recommend
```

### Request
#### Nameing file convertion
👉 With request which want to get List, get Many, ... Many Object with the same type, naming must be `GetList...Request`
```C#
UsersRequest // --> Do not
GetListUserRequest // --> Should be
```
👉 With request which want to get List Search, it must be inherited from  `QueryRequest` 

👉 With request which want to get Detail, get One, ... One Object , naming must be `GetDetail...Request`
```C#
UserRequest // --> Do not
GetDetailUserRequest // --> Should be
```

👉 With request which want to create new Data or Object , naming must be `Create...Request`
```C#
NewUser // --> Do not
CreateUserRequest // --> Should be
```

👉 With request which want to update Data or Object , naming must be `Update...Request`
```C#
UpdateUser // --> Do not
UpdateUserRequest // --> Should be
```
👉 With request which want to Delete with many id naming must be `BulkDelete...Request`
```C#
DeleteUsers // --> Do not
BulkDeleteUserRequest // --> Should be
```

### Response
👉 Response must create from OkResponse, ErrorResponse,... <br/>
```C#
return OkResponse<SampleResponse>(data, "Get data successfully");
```
See more in [APIController](./Api/Controllers/ApiController.cs) <br/>

👉 Response for list data must be created from `PaginationData`
```C#
return new PaginationData<BasicProductDto>(data, request.Offset, request.Page, total);
```
See more in [PaginationData](./Domain/DTOs/PaginationData.cs)
#### Naming file convention
👉 With response type List, Array, ... Many Object with the same type, naming must be `List...Repsonse`
```C#
UsersResponse // --> Do not
ListUserResponse // --> Should be
```

👉 With response type List in `table` we should have Prefix `Basic`
```C#
ListUserResponse // --> Do not
ListBasicUserResponse // --> Should be
```

👉 With response get Detail entity, naming should be add `Detail` in prefix
```C#
UserResponse // --> Do not
DetailUserResponse // --> Should be
```

### Service
#### Adding new Service must have suffix `Service`
For example:
```C#
Manage User 
-> IUserService // Interface
-> UserService // Service implement
```
After that, Add new Scope service in [AddServices](./Infrastructure/IOC/DependencyInjection.cs) file

### Repository
#### Adding new Repository must have suffix `Repository`
For example:
```C#
Get User from database
-> IUserRepository // Interface
-> UserRepository // Repository implement
```
After that, Add new Scope repository in [AddRepositories](./Infrastructure/IOC/DependencyInjection.cs) file

#### Finding a detail entity
👉 Finding service should return nullable and check null in `Controller`
```C#
// In SampleService.cs
Task<DetailEntity?> GetDetailEntityById (int id);
```

```C#
// In SampleController.cs
var data = _sampleService.GetDetailEntityById(id);

if (data is null) {
    throw new NotFoundException($"Not found entity Id={id}")
}
```