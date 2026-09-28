"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Context } from "../global/Context";
import { RegistrationTokenAPI } from "../utils/apiclient";
import type { RegisterUserRequest } from "../utils/types/api-contract";

export default function RegisterForm() {
  const [registrationToken, setRegistrationToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hasSubmittedToken, setHasSubmittedToken] = useState(false);
  const [invitedCompanyName, setInvitedCompanyName] = useState("");
  const [invitedRole, setInvitedRole] = useState("");

  const { sessionToken } = useContext(Context);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to home if already logged in
  // Checks every time the sessionToken changes
  useEffect(() => {
    if (sessionToken) {
      router.replace("/home");
    }
  }, [sessionToken, router]);


  useEffect(() => {
    const token = searchParams.get('registrationToken')
    if (token) {
      setRegistrationToken(token);
      submitRegistrationToken(token);
    }
  }, []);

  // Verify all required fields are filled out and filled correctly
  const verifyRequiredFields = () => {
    if (
      registrationToken.trim() === "" ||
      email.trim() === "" ||
      password === "" ||
      confirmPassword === "" ||
      firstName.trim() === "" ||
      lastName.trim() === ""
    ) {
      alert("Please fill out all fields before continuing.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Your passwords do not match.");
      return false;
    }

    return true;
  };

  // checks if all required fields are filled out and filled correctly before submission
  const canSubmitRegistration =
    registrationToken.trim() !== "" &&
    email.trim() !== "" &&
    password !== "" &&
    confirmPassword !== "" &&
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    password === confirmPassword;

  // sends the enetered reg token to the backend to get the token values
  const submitRegistrationToken = (token?: string) => {
    const code = token ? token.trim() : registrationToken.trim();
    if (!code) {
      alert("Enter your registration code first.");
      return;
    }

    RegistrationTokenAPI.getTokenValues(code)
      .then((response) => {
        setRegistrationToken(code);
        setEmail(response.email);
        setInvitedCompanyName(response.companyName);
        setInvitedRole(response.role);
        setHasSubmittedToken(true);
      })
      .catch((error) => {
        console.error("Error verifying token:", error);
        alert("Failed to verify registration code.");
      });
  };

  // clears all fields
  const clearFields = () => {
    setRegistrationToken("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setHasSubmittedToken(false);
    setInvitedCompanyName("");
    setInvitedRole("");
  };

  // sends the data to the backend to register the user
  const registerUserButton = () => {
    if (!verifyRequiredFields()) return;

    const apiPayload: RegisterUserRequest = {
      registrationToken: registrationToken.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    RegistrationTokenAPI.consumeToken(apiPayload)
      .then((response) => {
        console.log(response.message);
        clearFields();
        alert("Registration successful. You can sign in now.");
        router.replace("/login");
      })
      .catch((error) => {
        console.error("Error registering:", error);
        alert("Registration failed.");
      });
  };

  return (
    <div className="flex justify-center w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!hasSubmittedToken) {
            submitRegistrationToken();
            return;
          }
          registerUserButton();
        }}
      >
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Register</legend>

          <label className="label">Registration code</label>
          <input
            type="text"
            className="input"
            placeholder="Registration code"
            value={registrationToken}
            disabled={hasSubmittedToken}
            onChange={(e) => setRegistrationToken(e.target.value)}
            autoComplete="off"
          />

          {!hasSubmittedToken ? (
            <button type="submit" className="btn btn-neutral mt-4" disabled={registrationToken.trim() === ""}>
              Verify code
            </button>
          ) : (
            <button type="button" className="btn btn-neutral mt-4" onClick={clearFields}>
              Try new code
            </button>
          )}

          {hasSubmittedToken && (
            <>
              {invitedCompanyName ? (
                <p className="text-sm text-gray-600 mt-3">
                  Company: <span className="font-medium text-gray-800">{invitedCompanyName}</span>
                  {invitedRole ? (
                    <>
                      {" "}
                      · Role: <span className="font-medium text-gray-800">{invitedRole}</span>
                    </>
                  ) : null}
                </p>
              ) : null}

              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                readOnly
              />

              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label className="label">Confirm password</label>
              <input
                type="password"
                className={`input ${
                  password !== confirmPassword && confirmPassword !== "" ? "border-red-500" : ""
                }`}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <label className="label">First name</label>
              <input
                className="input"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <label className="label">Last name</label>
              <input
                className="input"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />

              <button
                type="submit"
                className="btn btn-neutral mt-4"
                disabled={!canSubmitRegistration}
              >
                Confirm registration
              </button>
            </>
          )}
        </fieldset>
      </form>
    </div>
  );
}
