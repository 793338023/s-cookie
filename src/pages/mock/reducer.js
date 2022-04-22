/**
 * 文件名 Reduxx.js
 */
import React, { useReducer, createContext } from "react";

// 1. 创建全局的Context
const Context = createContext();
export default Context;


// 2. 创建全局的Reducer
const initState = { left: [], right: [], header: { search: '', switch: false } };

const reducer = (state, action) => {
  switch (action.type) {
    case "left":
      return { ...state, left: [...action.payload] };
    case "right":
      return { ...state, right: [...action.payload] };
    case "header":
      return { ...state, header: { ...action.payload } };
    default:
      return state;
  }
};


// 3. 将全局useReducer返回的state和dispatch传递给全局Context.Provider的value中
export const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};
