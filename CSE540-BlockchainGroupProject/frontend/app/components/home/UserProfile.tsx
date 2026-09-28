"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { Context } from "../global/Context";
import DetailRow from "../global/DetailRow";
import { UserAPI } from "../utils/apiclient";
import type { Uuid } from "../utils/types/primitives";

export default function UserProfile() {
  const router = useRouter();
  const { userData, companyData, sessionToken, setUserData } = useContext(Context);

  const [firstName, setFirstName] = useState(userData?.firstName ?? "");
  const [lastName, setLastName] = useState(userData?.lastName ?? "");
  const [draftFirst, setDraftFirst] = useState(userData?.firstName ?? "");
  const [draftLast, setDraftLast] = useState(userData?.lastName ?? "");
  const [editingFirst, setEditingFirst] = useState(false);
  const [editingLast, setEditingLast] = useState(false);

  // sets the initial values of the first and last name
  useEffect(() => {
    if (!userData) return;
    setFirstName(userData.firstName);
    setLastName(userData.lastName);
    setDraftFirst(userData.firstName);
    setDraftLast(userData.lastName);
  }, [userData]);

  // Checks if the user's profile data has been edited
  const hasChangedData = useMemo(() => {
    return draftFirst.trim() !== firstName.trim() || draftLast.trim() !== lastName.trim();
  }, [draftFirst, draftLast, firstName, lastName]);

  // Triggers the update of the user's profile
  const saveProfile = () => {
    if (!sessionToken || !userData) {
      alert("You must be logged in to save your profile.");
      router.push("/login");
      return;
    }
    const tempFirstName = draftFirst.trim();
    const tempLastName = draftLast.trim();
    if (!tempFirstName || !tempLastName) {
      alert("First and last name are required.");
      return;
    }

    UserAPI.updateProfile(sessionToken, userData.userId, { firstName: tempFirstName,lastName: tempLastName, })
      .then((res) => {
        setUserData({
          ...userData,
          userId: res.user.userId,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          role: res.user.role,
        });
        setFirstName(res.user.firstName);
        setLastName(res.user.lastName);
        setDraftFirst(res.user.firstName);
        setDraftLast(res.user.lastName);
        setEditingFirst(false);
        setEditingLast(false);
        alert("Profile updated successfully.");
      })
      .catch((err) => {
        console.error(err);
        alert("Could not update profile.");
      });
  };

  // Cancels the edit of the first name
  const cancelEditFirst = () => {
    setDraftFirst(firstName);
    setEditingFirst(false);
  };

  // Cancels the edit of the last name
  const cancelEditLast = () => {
    setDraftLast(lastName);
    setEditingLast(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4 w-full max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">User profile</h1>

          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">Account</legend>
            <DetailRow label="Email" value={userData?.email ?? ""} />
            <DetailRow label="Role" value={userData?.role ?? ""} />
            <DetailRow label="User ID" value={userData?.userId ?? ""} mono />

            <div className="divider my-2" />

            <p className="text-sm text-gray-600 mb-3">Click a name to edit. Save applies both fields.</p>

            <div className="flex flex-col gap-3">
              <div>
                <span className="label">First name</span>
                {editingFirst ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      className="input input-bordered flex-1"
                      value={draftFirst}
                      onChange={(e) => setDraftFirst(e.target.value)}
                      autoComplete="given-name"
                    />
                    <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEditFirst}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="input input-bordered w-full text-left cursor-pointer hover:border-primary/50"
                    onClick={() => {
                      setDraftFirst(firstName);
                      setEditingFirst(true);
                    }}
                  >
                    {firstName || "Add first name"}
                  </button>
                )}
              </div>

              <div>
                <span className="label">Last name</span>
                {editingLast ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      className="input input-bordered flex-1"
                      value={draftLast}
                      onChange={(e) => setDraftLast(e.target.value)}
                      autoComplete="family-name"
                    />
                    <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEditLast}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="input input-bordered w-full text-left cursor-pointer hover:border-primary/50"
                    onClick={() => {
                      setDraftLast(lastName);
                      setEditingLast(true);
                    }}
                  >
                    {lastName || "Add last name"}
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-neutral mt-4 w-full sm:w-auto"
              disabled={!hasChangedData}
              onClick={saveProfile}
            >
              Save changes
            </button>
          </fieldset>

          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">Company</legend>
            <DetailRow label="Company name" value={companyData?.companyName ?? "—"} />
            <DetailRow label="Company ID" value={companyData?.companyId ?? "—"} mono />
            <DetailRow label="Wallet address" value={companyData?.walletAddress ?? "—"} mono />
          </fieldset>
        </div>
      </div>
    </div>
  );
}
