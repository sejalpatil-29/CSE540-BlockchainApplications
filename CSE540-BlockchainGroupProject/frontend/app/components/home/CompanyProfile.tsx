"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Context } from "../global/Context";
import DetailRow from "../global/DetailRow";
import { CompanyAPI, RegistrationTokenAPI } from "../utils/apiclient";
import type { RegistrationTokenModel } from "../utils/types/models";

export default function CompanyProfile() {
  const router = useRouter();
  const {companyData, sessionToken, setCompanyData, userData} = useContext(Context);

  const [viewSelect, setViewSelect] = useState<"companyProfile" | "userRegistration">("companyProfile");
  const [registrationTokenData, setRegistrationTokenData] = useState<RegistrationTokenModel[]>([]);
  const [companyName, setCompanyName] = useState("");

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "manager">("user");

  const isManager = userData?.role === "manager";

  // Sets the initial company name
  useEffect(() => {
    if (!companyData) return;
    setCompanyName(companyData.companyName);
  }, [companyData]);

  // Checks if the company name has been changed
  const hasCompanyChanges = useMemo(() => {
    if (!companyData) return false;
    return companyName.trim() !== companyData.companyName.trim();
  }, [companyName, companyData]);

  // Saves the company profile to the backend
  const saveCompanyProfile = () => {
    if (!sessionToken || !companyData) {
      alert("You must be logged in.");
      router.push("/login");
      return;
    }
    if (!isManager) {
      alert("Only managers can update company details.");
      return;
    }
    const name = companyName.trim();
    if (!name) {
      alert("Company name is required.");
      return;
    }

    CompanyAPI.updateCompany(sessionToken, companyData.companyId, {
      name,
      walletAddress: companyData.walletAddress ?? null,
    })
      .then((updated) => {
        setCompanyData(updated);
        setCompanyName(updated.companyName);
      })
      .catch((err) => {
        console.error(err);
        alert("Could not save company.");
      });
  };

  // Clears the registration data
  const clearRegistrationData = () => {
    setNewUserRole("user");
    setNewUserEmail("");
  };

  // Gets the updated token list from the backend
  const getUpdatedTokenList = () => {
    if (!sessionToken) {
      router.push("/login");
      return;
    }
    RegistrationTokenAPI.getTokenList(sessionToken)
      .then((response) => {
        setRegistrationTokenData(response);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to load registration tokens.");
      });
  };

  // Handles the new user view button
  const handleNewUserViewButton = () => {
    if (!sessionToken) {
      alert("You must be logged in.");
      router.push("/login");
      return;
    }
    if (!isManager) {
      alert("Only managers can manage registration tokens.");
      return;
    }
    getUpdatedTokenList();
    setViewSelect("userRegistration");
  };

  // Requests a new user token from the backend
  const requestNewUserTokenButton = () => {
    if (!sessionToken) return;
    const email = newUserEmail.trim();
    if (!email) return;

    RegistrationTokenAPI.generateToken(sessionToken, {
      userEmail: email,
      role: newUserRole,
    })
      .then(() => {
        getUpdatedTokenList();
        clearRegistrationData();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Could not create registration token.");
      });
  };

  // Revokes a user token from the backend
  const revokeToken = (token: RegistrationTokenModel) => {
    if (!sessionToken) return;
    RegistrationTokenAPI.revokeToken(sessionToken, token.tokenId)
      .then(() => {
        getUpdatedTokenList();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Could not revoke token.");
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4 w-full max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">Company</h1>

          <div className="flex flex-row gap-2 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm ${viewSelect === "companyProfile" ? "selected-styles" : "default-styles"}`}
              onClick={() => setViewSelect("companyProfile")}
            >
              Company profile
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewSelect === "userRegistration" ? "selected-styles" : "default-styles"}`}
              onClick={handleNewUserViewButton}
            >
              User registration tokens
            </button>
          </div>

          {viewSelect === "companyProfile" && (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Details</legend>
              <DetailRow label="Company ID" value={companyData?.companyId ?? ""} mono />

              <label className="label">Company name</label>
              <input
                className="input input-bordered w-full"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                readOnly={!isManager}
                autoComplete="organization"
              />

              <label className="label mt-3">Wallet address</label>
              <p className="font-mono text-sm break-all">{companyData?.walletAddress || "Not assigned"}</p>

              {!isManager && <p className="text-sm text-gray-600 mt-3">Manager only.</p>}

              {isManager && (
                <button
                  type="button"
                  className="btn btn-neutral mt-4 w-full sm:w-auto"
                  disabled={!hasCompanyChanges}
                  onClick={saveCompanyProfile}
                >
                  Save changes
                </button>
              )}
            </fieldset>
          )}

          {viewSelect === "userRegistration" && (
            <div className="flex flex-col gap-4">
              {!isManager ? (
                <p className="text-sm text-gray-600">Only managers can create or revoke registration tokens.</p>
              ) : (
                <>
                  <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                    <legend className="fieldset-legend">New token</legend>
                    <DetailRow label="Company ID" value={companyData?.companyId ?? ""} mono />
                    <DetailRow label="Company name" value={companyData?.companyName ?? ""} />

                    <label className="label">Email for invite</label>
                    <input
                      className="input input-bordered w-full"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      autoComplete="email"
                    />

                    <span className="label mt-3">Role</span>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          className="radio"
                          checked={newUserRole === "user"}
                          onChange={() => setNewUserRole("user")}
                        />
                        <span>User</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          className="radio"
                          checked={newUserRole === "manager"}
                          onChange={() => setNewUserRole("manager")}
                        />
                        <span>Manager</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      className="btn w-full mt-4"
                      onClick={requestNewUserTokenButton}
                      disabled={newUserEmail.trim() === ""}
                    >
                      Create token
                    </button>
                  </fieldset>

                  <div>
                    <h2 className="text-lg font-bold mb-3">Outstanding tokens</h2>
                    <div className="flex flex-col gap-3">
                      {registrationTokenData.length === 0 ? (
                        <p className="text-sm text-gray-600">No tokens loaded yet.</p>
                      ) : (
                        registrationTokenData.map((token) => (
                          <div
                            key={token.tokenId}
                            className="p-4 border rounded-lg shadow flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
                          >
                            <div className="flex flex-col min-w-0">
                              <div className="font-bold">{token.email}</div>
                              <div className="mt-1 text-xs font-mono break-all text-gray-600">{token.registrationToken}</div>
                              <div className="mt-1 text-sm">Role: {token.role}</div>
                              <div className="mt-1 text-sm">ID: {token.tokenId}</div>
                              <div
                                className={`mt-1 text-sm ${
                                  token.status === "used"
                                    ? "text-green-600"
                                    : token.status === "revoked"
                                      ? "text-red-600"
                                      : token.status === "pending"
                                        ? "text-yellow-600"
                                        : "text-gray-600"
                                }`}
                              >
                                {token.status}
                              </div>
                            </div>
                            {token.status === "pending" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline"
                                onClick={() => revokeToken(token)}
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
