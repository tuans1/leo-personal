"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { getS3TempCredentials } from "@/app/aws/s3-sdk/s3-sdk.api";
import {
  createS3ClientFromCreds,
  isCredentialStateValid,
  type S3ClientState,
} from "@/app/aws/s3-sdk/s3-client";

interface S3SdkContextValue {
  getValidClient: () => Promise<S3ClientState>;
}

const S3SdkContext = createContext<S3SdkContextValue | null>(null);

export function useS3SdkClient(): S3SdkContextValue {
  const ctx = useContext(S3SdkContext);
  if (!ctx) {
    throw new Error("useS3SdkClient must be used within S3SdkProvider");
  }
  return ctx;
}

export function S3SdkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<S3ClientState | null>(null);

  const getValidClient = useCallback(async (): Promise<S3ClientState> => {
    if (state && isCredentialStateValid(state)) {
      return state;
    }
    const creds = await getS3TempCredentials();
    const newState = createS3ClientFromCreds(creds);
    setState(newState);
    return newState;
  }, [state]);

  const value: S3SdkContextValue = { getValidClient };

  return (
    <S3SdkContext.Provider value={value}>{children}</S3SdkContext.Provider>
  );
}
