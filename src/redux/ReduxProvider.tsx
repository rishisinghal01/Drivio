
"use client"
import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'

function ReduxProvider({children}:{children:ReactNode}) {
  return (
    <div>
     <Provider store={store}>
        {children}
     </Provider>

    </div>
  )
}

export default ReduxProvider