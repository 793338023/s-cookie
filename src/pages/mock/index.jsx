/* eslint-disable no-undef */
import React, { useReducer, useContext } from 'react';
import { Provider } from './reducer';
import Header from './compoents/header';
import Left from './compoents/left';
import Right from './compoents/right';
import style from './style.module.scss';

const isNetwork = !!chrome?.devtools?.panels;

const Mock = () => {
  return (
    <div className={style.wrapper}>
      <div className={style.content}>
        <Header />
        <div className={`${style.body} ${isNetwork ? style.network : ''}`}>
          <Left />
          <Right />
        </div>
      </div>
    </div>
  );
};

export default () => (
  <Provider>
    <Mock />
  </Provider>
);
