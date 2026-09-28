"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react"
import { Context } from "./Context";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { sessionToken,setSessionToken } = useContext(Context);

    // Everytime sessionToken changes, update the isLoggedIn state
    // This will change once a backend token check is implemented to verify if the sessionToken is still valid
    useEffect(() => {
        if (sessionToken && sessionToken !== "") {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [ sessionToken ]);

    const handleLogout = () => {
        setSessionToken("");
        router.push("/login");
    };

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <button className="btn btn-ghost text-xl" onClick={() => router.push("/home")} >Home</button>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wide whitespace-nowrap text-base-content drop-shadow-sm">
                The Honest Harvest      
            </h1>
            <div className="navbar-end">
                {!isLoggedIn ? (<button className="btn" onClick={handleLogin}>
                        Login
                    </button>
                    ) : (
                    <button className="btn btn-error" onClick={handleLogout}>
                        Logout
                    </button>
                    )}
            </div>
        </div>
    );
}