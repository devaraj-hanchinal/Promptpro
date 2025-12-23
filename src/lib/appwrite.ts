"use client";

import { Client, Account, Databases, ID } from "appwrite";

const APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "6941561a0031b0bf7843"; 

let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

export function getAppwriteClient() {
  if (!client) {
    client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
  }
  return client;
}

export function getAppwriteAccount() {
  const client = getAppwriteClient();
  if (!account) {
    account = new Account(client);
  }
  return account;
}

export function getAppwriteDatabases() {
  const client = getAppwriteClient();
  if (!databases) {
    databases = new Databases(client);
  }
  return databases;
}

// --- THIS IS THE MISSING PIECE ---
export interface AppwriteUser {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    status: boolean;
    prefs: Record<string, any>;
}

export { ID };
