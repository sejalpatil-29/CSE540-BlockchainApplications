"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Context } from "../global/Context";
import { AuthAPI } from "../utils/apiclient";
import type { LoginRequest } from "../utils/types/api-contract";

export default function LoginForm() {
    const [ email, setEmail ] = useState<string>("");
    const [ password, setPassword ] = useState<string>("");
    
    const router = useRouter();
    const {sessionToken, setSessionToken, setUserData, setCompanyData } = useContext(Context);

    const loginButtonHandler = () => {
        if (!email.trim() || !password) {
            alert("Please enter your email and password.");
            return;
        }
        const apiPayload: LoginRequest = {
            email: email.trim(),
            password: password,
        };

        AuthAPI.login(apiPayload)
            .then(response => {
                setSessionToken(response.sessionToken);
                setUserData(response.user);
                setCompanyData(response.company);
                setEmail("");
                setPassword("");
                console.log("Login successful:", response);
                router.push("/home");
            })
            .catch(error => {
                console.error("Login failed:", error);
                alert("Login failed. Please check your email and password and try again.");
            });
    };

    // Redirect to home if already logged in
    useEffect(() => {
        if(sessionToken) {
            console.log("Already logged in, redirecting to home.");
            router.push("/home");
        }
    },[sessionToken, router]);

    return (
        <form
            className="w-full max-w-md space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                loginButtonHandler();
            }}
        >
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-5">
                <legend className="fieldset-legend">Login</legend>

                <label className="label">Email</label>
                <input
                    type="email"
                    className="input w-full"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                <label className="label mt-2">Password</label>
                <input
                    type="password"
                    className="input w-full"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
                    <button type="submit" className="btn btn-neutral w-full" disabled={!email.trim() || !password}>
                        Login
                    </button>
                    <button type="button" className="btn w-full" onClick={() => router.push("/register")}>
                        Register
                    </button>
                </div>
            </fieldset>

            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-5">
                <legend className="fieldset-legend">Check Supply Chain</legend>
                <button type="button" className="btn w-full" onClick={() => router.push("/supplychain")}>
                    Supply Chain
                </button>
            </fieldset>

            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-5">
                <legend className="fieldset-legend">Dev Tools</legend>
                <button type="button" className="btn w-full" onClick={() => router.push("/siteadmin")}>
                    Initialize Companies/Users
                </button>
            </fieldset>
        </form>
    );
}
