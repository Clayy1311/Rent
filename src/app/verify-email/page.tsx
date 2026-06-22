"use client";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage(){
    const searchParams = useSearchParams()
    const status = searchParams.get("status")

    return(
        <div>
            {status === "success" ? (
                <h1>Email Berhasil Diverifikasi</h1>
            ): (
                <h1>Link Verifikasi tidak Valid</h1>
            )}
        </div>
    )
}