import { createSlice } from "@reduxjs/toolkit";
const initialUser = JSON.parse(localStorage.getItem("userdata"))
  ? JSON.parse(localStorage.getItem("userdata"))
  : null;

const authSlice = createSlice({
  name: "auth",
  initialState: { user: initialUser },
  reducers: {
    setUsers: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("userdata", JSON.stringify(action.payload));
    },
    cleanUser: (state) => {
      state.user = null;
      localStorage.removeItem("userdata");
    },
  },
});

export const { setUsers, cleanUser } = authSlice.actions;
export default authSlice.reducer;
