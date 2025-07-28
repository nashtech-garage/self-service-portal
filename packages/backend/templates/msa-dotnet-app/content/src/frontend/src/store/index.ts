import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Các reducers
import appReducer from "@store/appSlice";
import assetReducer from "@store/assetSlice";
import assignmentReducer from "@store/assignmentSlice";
import authReducer from "@store/auth/authSlice.login";
import categoryReducer from "@store/categorySlice";
import createAssignmentReducer from "@store/createAssignmentSlice";
import editAssignmentReducer from "@store/editAssignmentSlice";
import homeReducer from "@store/homeAssignmentSlice";
import metaDataReducer from "@store/metaDataSlice";
import reportReducer from "@store/reportSlice";
import userReducer from "@store/userSlice";
import returningRequestSlice from "./returningRequestSlice";

// Cấu hình persist riêng cho authStatus
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["userProfile", "isAuthenticated"],
};

// Root reducer
const rootReducer = combineReducers({
  app: appReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  assets: assetReducer,
  users: userReducer,
  categories: categoryReducer,
  home: homeReducer,
  metaData: metaDataReducer,
  createAssignment: createAssignmentReducer,
  adminAssignments: assignmentReducer,
  returningRequest: returningRequestSlice,
  editAssignment: editAssignmentReducer,
  report: reportReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["app/showToast", FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ["payload.timestamp"],
        ignoredPaths: ["app.toast"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
