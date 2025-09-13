// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient, Db, Collection } from "mongodb"

// This module now supports TWO logical databases: one for Admin and one for Employee.
// You can configure either separate clusters (URIs) or a single cluster with two DB names.

// Admin DB config
const ADMIN_URI = process.env.MONGODB_URI_ADMIN || process.env.MONGODB_URI || "mongodb://localhost:27017"
const ADMIN_DB = process.env.MONGODB_DB_ADMIN || "admin_db"

// Employee DB config
const EMP_URI = process.env.MONGODB_URI_EMPLOYEE || process.env.MONGODB_URI || "mongodb://localhost:27017"
const EMP_DB = process.env.MONGODB_DB_EMPLOYEE || "emp_db"

if (!ADMIN_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI" or "MONGODB_URI_ADMIN"')
}
if (!EMP_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI" or "MONGODB_URI_EMPLOYEE"')
}

const options = {}

let adminClient: MongoClient
let employeeClient: MongoClient

let adminClientPromise: Promise<MongoClient>
let employeeClientPromise: Promise<MongoClient>

type GlobalWithDbClients = typeof globalThis & {
  _adminClientPromise?: Promise<MongoClient>
  _employeeClientPromise?: Promise<MongoClient>
}

const g = global as GlobalWithDbClients

// If both URIs are the same, share a single client instance to avoid extra connections
const sameCluster = ADMIN_URI === EMP_URI

if (process.env.NODE_ENV === "development") {
  if (!g._adminClientPromise) {
    adminClient = new MongoClient(ADMIN_URI, options)
    g._adminClientPromise = adminClient.connect()
  }
  adminClientPromise = g._adminClientPromise!

  if (sameCluster) {
    employeeClientPromise = adminClientPromise
  } else {
    if (!g._employeeClientPromise) {
      employeeClient = new MongoClient(EMP_URI, options)
      g._employeeClientPromise = employeeClient.connect()
    }
    employeeClientPromise = g._employeeClientPromise!
  }
} else {
  adminClient = new MongoClient(ADMIN_URI, options)
  adminClientPromise = adminClient.connect()

  if (sameCluster) {
    employeeClientPromise = adminClientPromise
  } else {
    employeeClient = new MongoClient(EMP_URI, options)
    employeeClientPromise = employeeClient.connect()
  }
}

// Database promises for convenience
export const adminDbPromise: Promise<Db> = adminClientPromise.then((c) => c.db(ADMIN_DB))
export const employeeDbPromise: Promise<Db> = employeeClientPromise.then((c) => c.db(EMP_DB))

// Collection helpers
export async function getAdminCollection<T extends Record<string, any> = any>(name: string): Promise<Collection<T>> {
  const db = await adminDbPromise
  return db.collection<T>(name)
}

export async function getEmployeeCollection<T extends Record<string, any> = any>(name: string): Promise<Collection<T>> {
  const db = await employeeDbPromise
  return db.collection<T>(name)
}

// Backward compatibility default export (kept for existing imports):
// returns the Admin client by default
export default adminClientPromise
