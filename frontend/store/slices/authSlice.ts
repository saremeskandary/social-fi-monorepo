import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

interface AuthState {
  principal?: string; // Only store serializable principal string
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  principal: undefined,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setIdentity(state, action: PayloadAction<{ principal: string }>) {
      state.principal = action.payload.principal;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.principal = undefined;
      state.isAuthenticated = false;
    },
  },
});

export const { setIdentity, logout } = authSlice.actions;
export default authSlice.reducer;
