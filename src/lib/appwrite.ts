"use client";

import { Client, Account, ID } from "appwrite";

// Hardcoded Appwrite configuration for reliability
const APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "6941561a0031b0bf7843";

let client: Client | null = null;
let account: Account | null = null;

export function getAppwriteClient() {
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    console.log("Appwrite client initialized with endpoint:", APPWRITE_ENDPOINT);
    console.log("Appwrite Project ID:", APPWRITE_PROJECT_ID);
  }

  return client;
}

export function getAppwriteAccount() {
  const appwriteClient = getAppwriteClient();
  
  if (!account) {
    account = new Account(appwriteClient);
    console.log("Appwrite Account instance created");
  }

  return account;
}

export { ID };

export interface AppwriteUser {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  emailVerification: boolean;
  status: boolean;
}
