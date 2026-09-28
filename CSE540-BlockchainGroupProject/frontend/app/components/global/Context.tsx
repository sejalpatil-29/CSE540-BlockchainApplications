"use client";

import { createContext, useState, ReactNode } from "react";
import { CompanyModel, UserModel } from "../utils/types/models";

// Global Varilable Type Definition for Context
type ContextType = {
    sessionToken: string | null;
    userData: UserModel | null;
    companyData: CompanyModel | null;
    setSessionToken: (token: string) => void;
    setUserData: (user: UserModel | null) => void;
    setCompanyData: (company: CompanyModel | null) => void;
};

// Create the actual context object with default values
export const Context = createContext<ContextType>({
    sessionToken: "",
    userData: null,
    companyData: null,
    setSessionToken: () => {},
    setUserData: () => {},
    setCompanyData: () => {},
});

export const Provider = ({ children }: { children: ReactNode }) => {
    // Local state for the context values, they live in this component and are passed down viacontext provider
    const [userData, setUserData] = useState<UserModel | null>(null);
    const [companyData, setCompanyData] = useState<CompanyModel | null>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    return (
        <Context.Provider value={{ sessionToken, userData, companyData, setSessionToken, setUserData, setCompanyData }}>
            {children}
        </Context.Provider>
    );
};