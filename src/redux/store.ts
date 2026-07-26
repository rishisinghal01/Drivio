import { configureStore } from '@reduxjs/toolkit'
// ...
import userReducer from './userSlice'

export const store = configureStore({
  reducer: { // reducer helps us to take data from the store or sending data to the store
     user:userReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch