"use client";

import { useEffect, useState } from "react";
import { RegistrationTokenAPI } from "./utils/apiclient";
import type { CreateCompanyAdminTokenRequest } from "./utils/types/api-contract";
import type { CompanyModel, RegistrationTokenModel } from "./utils/types/models";
import { useRouter } from "next/navigation";

export default function SiteAdmin() {
    const [ newCompanyName, setNewCompanyName ] = useState<string>("");
    const [ viewSelect , setViewSelect ] = useState<"CompanyManager" | "AddUserToCompany">("CompanyManager");
    const [ allCompaniesList, setAllCompaniesList ] = useState<CompanyModel[]>([])
    const [ selectedCompany, setSelectedCompany ] = useState<CompanyModel | null>(null);
    const [ newUserEmail, setNewUserEmail ] = useState<string>("");
    const [ registrationTokens, setRegistrationTokens ] = useState<RegistrationTokenModel[]>([]);
    const router = useRouter();

    useEffect(() => {
        updateCompanyList();
    }, []);
    
    const showCompaniesView = () => {
        setViewSelect("CompanyManager");
        updateCompanyList();
    };

    const handleInitiateCreateUserButton = (company: CompanyModel) => {
        setSelectedCompany(company);
        getRegistrationTokensForCompany(company);
        setViewSelect("AddUserToCompany");
    };

    const updateCompanyList = () => {
        RegistrationTokenAPI.getAllCompanies()
            .then( response => {
                setAllCompaniesList(response);
                console.log(response)
            })
            .catch( error => {
                console.error("Error:", error)
                alert("Failed to fetch company list")
            })
    };

    const addNewCompanyButton = () => {
        RegistrationTokenAPI.createCompany(newCompanyName)
            .then( response => {
                updateCompanyList();
                alert("New Company Created!")

            })
            .catch( error => {
                console.error("Error:", error)
                alert("Failed to create company")               
            })
    };

    const createNewManagerButton = () => {
        if (!selectedCompany?.companyId) {
            alert("Choose a company first (Companies tab → Generate Manager Token on a row).");
            return;
        }
        const email = newUserEmail.trim();
        if (!email) return;

        const apiPayload: CreateCompanyAdminTokenRequest = {
            companyId: selectedCompany.companyId,
            userEmail: email,
        };
        
        RegistrationTokenAPI.createCompanyAdminToken(apiPayload)
            .then((response) => {
                alert("Token: " + response.registrationToken);
                getRegistrationTokensForCompany(selectedCompany);

                
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Failed to create manager token");
            });
    };
    
    const getRegistrationTokensForCompany = (company: CompanyModel) => {
        RegistrationTokenAPI.getTokenListDev(company.companyId)
            .then( response => {
                setRegistrationTokens(response);
            })
            .catch( error => {
                console.error("Error:", error);
                alert("Failed to fetch registration tokens");
            });
    };

    const useToken = (token: RegistrationTokenModel) => {
        router.push(`/register?registrationToken=${token.registrationToken}`);
    };

    type SiteAdminCardProps = {
        title: string;
        lines: string[];
        actionLabel: string;
        onAction: () => void;
        actionTitle?: string;
    };

    function SiteAdminCard({title, lines, actionLabel, onAction, actionTitle}: SiteAdminCardProps) {
        return (
            <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                <div className="card-body p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="card-title text-base">{title}</h3>
                            {lines.map((line, index) => (
                                <p key={`${title}-${index}`} className="mt-1 text-sm break-all">
                                    {line}
                                </p>
                            ))}
                        </div>
                        <div className="card-actions sm:justify-end">
                            <button type="button" className="btn btn-sm" onClick={onAction} title={actionTitle}>
                                {actionLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex justify-center pb-40">
                <div className="flex flex-col gap-4 p-4 w-full max-w-lg">
                    <div className="flex flex-row gap-2 w-full flex-wrap">
                        <button 
                        className={`btn btn-sm flex-1 min-w-0 ${viewSelect === "CompanyManager" ? 'btn-primary' : 'btn-neutral'}`}
                        onClick={showCompaniesView}
                        >
                            Create Company
                        </button>
                        <button
                        className={`btn btn-sm flex-1 min-w-0 ${viewSelect === "AddUserToCompany" ? 'btn-primary' : 'btn-neutral'}`}
                        onClick={() => {
                            setViewSelect("AddUserToCompany");
                        }}
                        >
                            Manager Registration Token
                        </button>
                    </div>
                    { viewSelect === "CompanyManager" &&
                    <>
                        <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                            <div className="card-body p-4">
                                <h3 className="card-title text-base">Add New Company</h3>

                                <div className="mt-3">
                                    <label className="text-sm text-base-content/70">Company name</label>
                                    <input
                                        className="input w-full mt-1"
                                        value={newCompanyName}
                                        onChange={(e) => setNewCompanyName(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="btn w-full mt-4"
                                    onClick={addNewCompanyButton}
                                    disabled={newCompanyName.trim() === ""}
                                >
                                    Create Company
                                </button>
                            </div>
                        </div>

                        <hr/>

                        <h2 className="text-lg font-bold">Companies</h2>
                        <div className="flex flex-col gap-3">
                            {allCompaniesList?.map((company) => 
                            <SiteAdminCard
                                key={company.companyId}
                                title={company.companyName}
                                lines={[
                                    `ID: ${company.companyId}`,
                                    `Address: ${company.walletAddress || "No Wallet Address"}`,
                                ]}
                                actionLabel={"Generate Manager Token"}
                                onAction={() => handleInitiateCreateUserButton(company)}
                                actionTitle={company.walletAddress === null ? "Company has no wallet address" : ""}
                            />
                            )}
                        </div>
                    </>
                    }


                    { viewSelect === "AddUserToCompany" &&
                    <>
                        <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                            <div className="card-body p-4">
                                <h2 className="card-title text-base">Add New Company</h2>
                                <p className="text-sm text-gray-500 mb-4">Invite link is always for a manager role.</p>
                                {!selectedCompany ? (
                                    <p className="text-amber-700 text-sm mb-4">
                                        No company selected. Open the Companies tab and click &quot;Generate Manager Token&quot; on a row.
                                    </p>
                                ) : (
                                    <>
                                        <div className="mb-2">
                                            <p className="text-sm text-gray-500">Company ID</p>
                                            <p className="font-mono">{selectedCompany.companyId}</p>
                                        </div>

                                        <div className="mb-2">
                                            <p className="text-sm text-gray-500">Company Name</p>
                                            <p className="font-mono">{selectedCompany.companyName}</p>
                                        </div>
                                    </>
                                )}
                                <div className="mt-3">
                                    <label className="text-sm text-base-content/70">New user email</label>
                                    <input
                                        className="input w-full mt-1"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="btn w-full mt-4"
                                    onClick={createNewManagerButton}
                                    disabled={newUserEmail.trim() === ""}
                                >
                                    Create Manager Token
                                </button>
                            </div>
                        </div>
                        
                        <hr/>

                        <h2 className="text-lg font-bold">Company Registration Tokens</h2>
                        <div className="flex flex-col gap-3">
                            {registrationTokens?.map((token) => 
                            <SiteAdminCard
                                key={token.tokenId}
                                title={token.email}
                                lines={[
                                    `Status: ${token.status}`,
                                    `Token: ${token.registrationToken}`,
                                ]}
                                actionLabel={token.status === "used" ? "Cannot use token" : "Use Token"}
                                onAction={token.status === "used" ? ()=>{alert("Cannot use token")} : () => useToken(token)}
                                actionTitle={token.status === "used" ? "Cannot use token" : ""}
                            />
                            )}
                        </div>
                    </>
                    }
                </div>
            </div>
        </div>  
    );
}
