import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import { socialMediaApi } from "./api/socialMediaApi";
import { userManagerApi } from "./api/userManagerApi";
import { searchApi } from "./api/searchApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [socialMediaApi.reducerPath]: socialMediaApi.reducer,
    [userManagerApi.reducerPath]: userManagerApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the Redux state
        ignoredPaths: [
          "socialMediaApi.queries",
          "userManagerApi.queries",
          "searchApi.queries",
        ],
        // Ignore these action types
        ignoredActions: [
          "socialMediaApi/executeQuery/fulfilled",
          "userManagerApi/executeQuery/fulfilled",
          "searchApi/executeQuery/fulfilled",
          "auth/setIdentity",
        ],
      },
    })
      .concat(socialMediaApi.middleware)
      .concat(userManagerApi.middleware)
      .concat(searchApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
