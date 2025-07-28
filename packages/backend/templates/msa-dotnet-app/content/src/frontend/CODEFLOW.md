## CODE FLOW FOR FRONT END 

## Coding convention
### Setting for vscode
Format code before commit and push 😁

For more information, read [eslint-guide.md](./eslint-guide.md)

## MAIN FLOW
### First, create interfaces in type that match BE response
#### For example, see [auth.ts](/src/frontend/src/types/auth.ts)

### Second, create service 
#### See [authService](./src/services/authService.ts)

#### !! Note that service function must return Promise<ApiResponse<...>>
#### !! Must use axiosIntance to interact with API
```TypeScript
const { data } = await axiosInstance.put<ApiResponse<null>>('/auth/change-password', {
    currentPassword,
    newPassword,
});
```

### Next, create slice in store for state management
#### See example in [authSlice.login](./src/store/auth/authSlice.login.ts)
#### First, create thunk
```TypeScript
export const getMe = createAsyncThunk<unknown, void>("auth/get-me", 
    async (_, { rejectWithValue }) => {
        const response = await authService.getme();
        return response.data;
    }
);
```

#### Secondly, create slice
```TypeScript
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    ...
  },
  extraReducers: (builder) => {
    builder
      ...
  },
});
```

### Create new pages in [pages](./src/pages/)
### Create new components in [components](./src/components/)
### To call API and interact with thunk, use

```TypeScript
import { useDispatch, useSelector } from "react-redux";
```
### Then, define dispatch like
```TypeScript
const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  ....
  //Use useselector to get state from redux
  const user = useSelector((state: RootState) => state.auth.user);


  //Use dispatch to call API
  await dispatch(login(data)).unwrap();
}
```
### EVERY COMPONENT WILL HAVE IT OWN CSS FILE
### !! PLEASE USE THEME DECLARE IN [_theme.scss](./src/css/_theme.scss)
### !! IF THERE IS MORE VARIABLE, ADD IN [_variable.scss](./src/css/_variables.scss) THEN ADD IT IN THEME, 


## VALIDATION 
### First, create fields validation in [fieldValidators](./src/schemas/helpers/), see example in [login](./src/schemas/helpers/fieldValidators.login.ts)
### Second, create schema in [schema](./src/schemas/)
### Then, use like this 
```TypeScript
const Login: React.FC = () => {
 
  
  const {           
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
  
  const onSubmit = async (data: LoginForm) => {
    ...
  };

  return (
    <div className="login-container">
      
        <form onSubmit={handleSubmit(onSubmit)}> //USE HANDLE SUBMIT
          <InputWrapper 
            title="Username"
            error={errors.username?.message}     //USE ERROR
            htmlFor="username"
          >
            <InputText
              id="username"
              {...register("username")}         //USE REGISTER
              className={`input-field w-full ${errors.username ? "p-invalid" : ""}`}
            />
          </InputWrapper>
         ....
            <Controller
              name="password"
              control={control} //USE CONTROL
              render={({ field }) => (
                ...
              )}
            />
          </InputWrapper>
          
          <div className="form-group mt-3 form-actions">
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={!isValid}       //USE isValid
            >
              Login
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;

```


## SHOW TOAST
```TypeScript
import { useToastContext } from "@components/Toast/useToastContext";
....
 try {
        ...
        showSuccess("Password changed successfully!", "Success");
        ...
    } catch (err: unknown) {
      showError(message, "Error");
    } finally {
        ...
    }
```

### For more information, read [Toast](./src/components/Toast/Toast.tsx)


