'use client';
import { useRouter } from 'next/navigation';
import { ReactNode, useContext, useEffect } from 'react';
import { Context } from '@/app/components/global/Context';

export default function ProtectedRoute({ children }: { children: ReactNode })  {
    const { sessionToken } = useContext(Context);
    const router = useRouter();

    // Redirects to login if no session token is found
    useEffect(() => {
        if (!sessionToken) {
            console.log("No session token found, redirecting to login.");
            router.replace('/login');
        }
        console.log("You have a valid session!");
    }, []);


    return sessionToken ? children : null;
}