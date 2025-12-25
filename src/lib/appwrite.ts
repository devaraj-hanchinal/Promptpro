"use client";

import { Client, Account, Databases, ID } from "appwrite";

/**
 * Must be configured in Vercel Environment variables:
 * NEXT_PUBLIC_APPWRITE_ENDPOINT
 * NEXT_PUBLIC_APPWRITE_PROJECT_ID
 */

const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1";

const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6941561a0031b0bf7843";

// Lazy-loaded instances (singleton pattern)
let client: Client | null = null;
let accountInstance: Account | null = null;
let databasesInstance: Databases | null = null;

// Init Appwrite Client
export function getAppwriteClient() {
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
  }
  return client;
}

// Get Account Instance
export function getAppwriteAccount() {
  if (!accountInstance) {
    accountInstance = new Account(getAppwriteClient());
  }
  return accountInstance;
}

// Get Databases Instance
export function getAppwriteDatabases() {
  if (!databasesInstance) {
    databasesInstance = new Databases(getAppwriteClient());
  }
  return databasesInstance;
}

// 🔥 EXPORT these for easy import everywhere:
export const account = getAppwriteAccount();
export const databases = getAppwriteDatabases();
export const appwriteClient = getAppwriteClient();

// Useful typings
export interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  status: boolean;
  prefs: Record<string, any>;
}

export { ID };

