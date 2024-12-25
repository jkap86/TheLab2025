"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "./store";

interface ProviderWrapperProps {
  children: ReactNode;
}

const ProviderWrapper = ({ children }: ProviderWrapperProps) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ProviderWrapper;
