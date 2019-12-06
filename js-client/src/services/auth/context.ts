import React from "react";

export interface IAuthContext {}

const defaultValue: IAuthContext = {};

export const { Provider, Consumer } = React.createContext<any>(defaultValue);
